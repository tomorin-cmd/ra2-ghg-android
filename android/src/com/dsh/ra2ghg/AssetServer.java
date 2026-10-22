package com.dsh.ra2ghg;

import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Tiny loopback HTTP server that exposes the APK's assets to the WebView.
 *
 * Why a server instead of file:// or WebViewAssetLoader:
 *  - the engine fetches /gameres/... with streaming fetch and OPFS write;
 *  - SharedArrayBuffer needs COOP/COEP headers;
 *  - the 280 MB ra2.mix must stream, not be copied into a byte[].
 *
 * The origin (http://127.0.0.1:8787) is stable, so the OPFS seed survives
 * app restarts.
 */
public final class AssetServer {
    private static final String TAG = "RA2AssetServer";
    private static final int BUFFER_SIZE = 128 * 1024;

    private final AssetManager assets;
    private final int requestedPort;
    private final ExecutorService pool = Executors.newCachedThreadPool();
    private volatile boolean running;
    private ServerSocket serverSocket;

    public AssetServer(AssetManager assets, int port) {
        this.assets = assets;
        this.requestedPort = port;
    }

    public void start() throws IOException {
        ServerSocket socket = new ServerSocket();
        socket.setReuseAddress(true);
        socket.bind(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), requestedPort), 64);
        this.serverSocket = socket;
        this.running = true;
        Thread acceptThread = new Thread(() -> {
            while (running) {
                try {
                    Socket client = socket.accept();
                    pool.execute(() -> handle(client));
                } catch (IOException e) {
                    if (running) {
                        Log.w(TAG, "accept failed", e);
                    }
                }
            }
        }, "ra2-asset-accept");
        acceptThread.setDaemon(true);
        acceptThread.start();
        Log.i(TAG, "listening on http://127.0.0.1:" + getPort() + "/");
    }

    public int getPort() {
        ServerSocket socket = serverSocket;
        return socket != null ? socket.getLocalPort() : requestedPort;
    }

    public void stop() {
        running = false;
        try {
            if (serverSocket != null) {
                serverSocket.close();
            }
        } catch (IOException ignored) {
        }
        pool.shutdownNow();
    }

    private void handle(Socket client) {
        try (Socket socket = client) {
            socket.setSoTimeout(30000);
            BufferedInputStream in = new BufferedInputStream(socket.getInputStream());
            OutputStream out = new BufferedOutputStream(socket.getOutputStream(), BUFFER_SIZE);

            String requestLine = readAsciiLine(in);
            if (requestLine == null) {
                return;
            }
            String[] parts = requestLine.split(" ");
            if (parts.length < 2) {
                writeText(out, 400, "Bad Request", "bad request");
                return;
            }
            String method = parts[0].toUpperCase(Locale.US);
            if (!"GET".equals(method) && !"HEAD".equals(method)) {
                writeText(out, 405, "Method Not Allowed", "method not allowed");
                return;
            }
            // Drain request headers.
            String header;
            while ((header = readAsciiLine(in)) != null && !header.isEmpty()) {
                // no request body expected
            }

            String rawPath = parts[1];
            int query = rawPath.indexOf('?');
            if (query >= 0) {
                rawPath = rawPath.substring(0, query);
            }
            String path;
            try {
                path = URLDecoder.decode(rawPath, "UTF-8");
            } catch (Exception e) {
                path = rawPath;
            }
            path = path.replace('\\', '/').replaceAll("/{2,}", "/");
            if (path.isEmpty() || "/".equals(path)) {
                path = "/index.html";
            }
            if (path.contains("..")) {
                writeText(out, 403, "Forbidden", "forbidden");
                return;
            }

            String assetPath;
            if (path.startsWith("/gameres/")) {
                assetPath = "gameres/" + path.substring("/gameres/".length());
            } else {
                assetPath = "web/" + path.substring(1);
            }
            String type = contentType(assetPath);
            Log.i(TAG, method + " " + path + " -> " + assetPath);

            if ("/__debug__".equals(path)) {
                StringBuilder listing = new StringBuilder();
                for (String dir : new String[]{"", "web", "gameres"}) {
                    listing.append("[").append(dir).append("] ")
                            .append(Arrays.toString(assets.list(dir))).append("\n");
                }
                writeText(out, 200, "OK", listing.toString());
                return;
            }

            if (!assetPath.startsWith("gameres/")) {
                // Web assets are small; reading them fully guarantees an exact
                // Content-Length even if aapt2 compressed the asset.
                try {
                    byte[] bytes = readAll(assets.open(assetPath, AssetManager.ACCESS_STREAMING));
                    writeBytes(out, bytes, type, method);
                } catch (FileNotFoundException e) {
                    Log.w(TAG, "missing web asset: " + assetPath, e);
                    writeText(out, 404, "Not Found", "not found");
                }
                return;
            }

            // Game resources: stream, never load 280 MB into memory.
            AssetFileDescriptor fd = null;
            InputStream data = null;
            long length = -1;
            try {
                fd = assets.openFd(assetPath);
                length = fd.getLength();
                data = fd.createInputStream();
            } catch (FileNotFoundException compressedOrMissing) {
                // aapt2 compresses small files (manifest.json, rules.ini, csf).
                // They are all tiny; read them fully so Content-Length is exact.
                try {
                    byte[] bytes = readAll(assets.open(assetPath, AssetManager.ACCESS_STREAMING));
                    data = new ByteArrayInputStream(bytes);
                    length = bytes.length;
                } catch (FileNotFoundException missing) {
                    writeText(out, 404, "Not Found", "not found");
                    return;
                }
            }

            if (length < 0) {
                if (data != null) {
                    data.close();
                }
                if (fd != null) {
                    fd.close();
                }
                writeText(out, 500, "Internal Server Error", "unknown asset length");
                return;
            }

            String head = "HTTP/1.1 200 OK\r\n"
                    + "Content-Type: " + type + "\r\n"
                    + "Content-Length: " + length + "\r\n"
                    + "Cross-Origin-Opener-Policy: same-origin\r\n"
                    + "Cross-Origin-Embedder-Policy: require-corp\r\n"
                    + "Cross-Origin-Resource-Policy: cross-origin\r\n"
                    + "Access-Control-Allow-Origin: *\r\n"
                    + "Cache-Control: no-store\r\n"
                    + "Connection: close\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.US_ASCII));
            if (!"HEAD".equals(method) && data != null) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int read;
                while ((read = data.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
            }
            out.flush();
            if (data != null) {
                data.close();
            }
            if (fd != null) {
                fd.close();
            }
        } catch (Exception e) {
            Log.w(TAG, "request failed: " + e.getMessage());
        }
    }

    private static void writeBytes(OutputStream out, byte[] bytes, String type, String method)
            throws IOException {
        String head = "HTTP/1.1 200 OK\r\n"
                + "Content-Type: " + type + "\r\n"
                + "Content-Length: " + bytes.length + "\r\n"
                + "Cross-Origin-Opener-Policy: same-origin\r\n"
                + "Cross-Origin-Embedder-Policy: require-corp\r\n"
                + "Cross-Origin-Resource-Policy: cross-origin\r\n"
                + "Access-Control-Allow-Origin: *\r\n"
                + "Cache-Control: no-store\r\n"
                + "Connection: close\r\n\r\n";
        out.write(head.getBytes(StandardCharsets.US_ASCII));
        if (!"HEAD".equals(method)) {
            out.write(bytes);
        }
        out.flush();
    }

    private static void writeText(OutputStream out, int code, String reason, String body)
            throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        String head = "HTTP/1.1 " + code + " " + reason + "\r\n"
                + "Content-Type: text/plain; charset=utf-8\r\n"
                + "Content-Length: " + bytes.length + "\r\n"
                + "Cache-Control: no-store\r\n"
                + "Connection: close\r\n\r\n";
        out.write(head.getBytes(StandardCharsets.US_ASCII));
        out.write(bytes);
        out.flush();
    }

    private static byte[] readAll(InputStream in) throws IOException {
        try (InputStream input = in; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[16 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            return out.toByteArray();
        }
    }

    private static String readAsciiLine(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream(128);
        int c;
        while ((c = in.read()) != -1) {
            if (c == '\n') {
                break;
            }
            if (c != '\r') {
                out.write(c);
            }
            if (out.size() > 8192) {
                break;
            }
        }
        if (c == -1 && out.size() == 0) {
            return null;
        }
        return out.toString("UTF-8");
    }

    private static String contentType(String path) {
        String lower = path.toLowerCase(Locale.US);
        if (lower.endsWith(".html")) return "text/html; charset=utf-8";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "text/javascript; charset=utf-8";
        if (lower.endsWith(".css")) return "text/css; charset=utf-8";
        if (lower.endsWith(".json")) return "application/json; charset=utf-8";
        if (lower.endsWith(".wasm")) return "application/wasm";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".webm")) return "video/webm";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".ini") || lower.endsWith(".txt")) return "text/plain; charset=utf-8";
        return "application/octet-stream";
    }
}


