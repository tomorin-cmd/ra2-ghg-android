import os
import sys
import zipfile


def add_file(zf, src, arcname, compress):
    info = zipfile.ZipInfo(arcname)
    info.compress_type = zipfile.ZIP_DEFLATED if compress else zipfile.ZIP_STORED
    info.file_size = os.path.getsize(src)
    info.external_attr = (0o644 & 0xFFFF) << 16
    with open(src, "rb") as src_file, zf.open(info, "w") as dst:
        while True:
            chunk = src_file.read(1024 * 1024)
            if not chunk:
                break
            dst.write(chunk)


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: pack_assets.py <base.apk> <assets-dir> <classes.dex>")
    apk, assets_dir, dex = sys.argv[1:4]
    with zipfile.ZipFile(apk, "a", allowZip64=True) as zf:
        existing = set(zf.namelist())
        if "classes.dex" not in existing:
            add_file(zf, dex, "classes.dex", True)
            existing.add("classes.dex")
        count = 0
        total = 0
        for root, _dirs, files in os.walk(assets_dir):
            for name in files:
                src = os.path.join(root, name)
                rel = os.path.relpath(src, assets_dir).replace("\\", "/")
                arc = "assets/" + rel
                if arc in existing:
                    continue
                compress = not name.lower().endswith(".mix")
                add_file(zf, src, arc, compress)
                existing.add(arc)
                count += 1
                total += os.path.getsize(src)
        print(f"packed {count} files, {total} bytes")


if __name__ == "__main__":
    main()
