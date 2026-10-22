# Red Alert 2: Glory of the Republic, Android Lightweight Edition

[简体中文](README.md) | English

> **Skirmish only**
>
> This project feeds data from *Command & Conquer: Red Alert 2* and the *Glory of the Republic* mod into a TypeScript/WebGL engine running inside an Android WebView.

> The repository contains code, build scripts, and documentation. You must extract game assets from a copy of the game you own.

---

## Why I Built This

I grew up playing *Red Alert 2* and *Glory of the Republic* on PC. Phones are fast enough to run a skirmish now, but the existing options were inconvenient. Winlator and Box64 are heavy, run poorly, and feel awkward with touch controls. Mod packs had inconsistent compatibility, so I wrote my own port.

> **The goal was simple: revisit a childhood game on a phone and play a skirmish whenever I want.**

This is not a full remaster, and it does not restore the campaign. It is a lightweight build that installs on a phone and opens directly into a skirmish.

---

## Features

1. Skirmish mode
2. Custom maps, opponents, countries, colors, and difficulty
3. China units included
4. Build menu and building placement, mining, combat, and basic enemy AI
5. Touch controls
6. Load game and LAN multiplayer (UI present, not fully tested)

---

## Screenshots

These are real screenshots from my phone, not renders.

### Main menu

![Phone main menu: Skirmish, Load Game, LAN Multiplayer, Options](docs/images/main-menu.jpg)

The main menu is in Chinese and contains Skirmish, Load Game, LAN Multiplayer, and Options. There is no campaign button. The menu video was converted from Bink to WebM.

### Skirmish

![Phone skirmish: Allied base, Chinese HUD, China mod units](docs/images/gameplay.jpg)

The game runs fullscreen in landscape. The HUD and build menu are in Chinese, and China mod units and buildings are available. Touch controls handle unit selection, MCV deployment, construction, mining, and combat.

The screenshot comes from a 1272×2800 phone screen.

---

## Installation

### Build It Yourself

The repository does not publish an APK with game assets. You need:

- A copy of *Red Alert 2*;
- The *Glory of the Republic* mod;
- The original installer or an extracted game directory.

Follow “Building from Source” to produce `android/ra2ghg.apk`. Assets come from your own game, which carries the least risk.

### Use a Personal Test APK

If someone gives you a personal test build:

- Android 8.0 or newer, arm64 CPU, 4 GB of RAM or more;
- At least 2 GB of free storage;
- Allow installation from unknown sources;
- The first launch writes about 444 MB of assets, so keep the app in the foreground and keep the screen on;
- Open Skirmish and choose China, a map, opponents, colors, and difficulty;
- Tap an MCV, deploy the Construction Yard, and start building.

Do not redistribute an APK that contains `ra2.mix`, `language.mix`, or other original assets.

---

## Compatibility

I have only tested this app on one phone:

- OnePlus Ace 5 Ultimate, model `PLC110`
- Android 16 / API 36
- arm64-v8a, MediaTek MT6991
- 1272×2800, 560 dpi
- WebView 154
- 12 GB RAM, about 50 GB free storage

The app depends on Android System WebView for WebGL, Workers, and OPFS. Different WebView versions, GPU drivers, screen ratios, and touch mappings produce different results. I did not test multiple devices.

Other phones may show:

- A black or corrupted first frame;
- WebGL context creation failures;
- Offset touch input;
- Incorrect font or UI sizes;
- Low frame rates, overheating, or memory pressure;
- A stalled first asset copy.

A successful launch does not guarantee stable play.

---

## Repository Contents

```text
redalert2/     TypeScript/WebGL engine, UI, Chinese localization
android/       WebView shell, local HTTP server, build scripts
docs/          Screenshots and documentation
tools/         Debug scripts
README.md      Chinese README
README_EN.md   English README
LICENSE
```

The repository does not contain an APK, `ra2.mix`, `language.mix`, `general.csf`, maps, SHP, or VXL files.

---

## Why the Repository Does Not Include a Full Game Package

### Copyright

`ra2.mix`, `language.mix`, `general.csf`, maps, and models belong to EA / Westwood. Assets from *Glory of the Republic* belong to the mod's original authors. I have no right to redistribute those files under an open-source label.

### Size

A complete APK is about 450 MB, mostly original assets. That size does not belong in a Git repository.

### Distribution Risk

APKs with assets are easy to repackage, monetize with ads, or sell. Uploading one creates problems for users and for the upstream projects.

---

## Scope

The project covers skirmish, a Chinese interface, China mod units, touch controls, construction, and basic AI.

Campaign, campaign movies, and background music are out of scope. `movies01.mix` and `movies02.mix` contain 5-byte placeholders, and `theme.mix` is empty.

---

## How It Works

The original game stores rules, maps, text, and art in MIX, INI, CSF, SHP, and VXL files. This project keeps that data, reimplements the game logic in TypeScript, and renders with WebGL.

Android runs a WebView. The WebView reads assets from the APK through a local HTTP server, then writes the assets to OPFS.

```text
APK
├─ assets/web/       React + TypeScript engine
└─ assets/gameres/   Original MIX / INI / CSF / SHP / VXL
        │
        ▼
Android WebView (Chromium / V8)
├─ TypeScript game logic
├─ WebGL / Three.js rendering
├─ Web Worker / WASM decoding
└─ OPFS asset cache
        ▲
        │ fetch
AssetServer (Java, local HTTP)
http://127.0.0.1:8787
```

The project does not execute the original `game.exe` and does not use Wine, Box64, or Winlator. V8 runs JavaScript directly, and WebGL renders directly.

### Local HTTP and OPFS

A `file://` page in WebView does not provide stable OPFS, localStorage, or SharedArrayBuffer. Workers, fetch, and module loading also run into CORS limits.

The Android shell starts an HTTP server bound only to `127.0.0.1`, on fixed port 8787, with COOP/COEP response headers. The page loads from `http://127.0.0.1:8787/`.

The port cannot change. A different port means a different origin, and the OPFS cache becomes invalid.

The first launch writes about 444 MB of assets to OPFS. Later launches reuse that data.

---

## Known Issues

The project is archived. These issues are not scheduled for a fix.

### Slow First Launch

The app writes about 444 MB of assets to OPFS. The screen stays on “Loading” while this runs. Wait for it to finish.

### Only Skirmish

The project has no campaign, movies, or music. Those files are missing or damaged, so skirmish is the only mode.

### Device Compatibility

I tested one phone. Other devices may show a black screen, drop frames, offset touch input, or fail to enter the game.

### Map and Tech Compatibility

Some maps reference unsupported tech. Some mod units and buildings behave incorrectly in the late game. I did not regression-test every map or unit.

### LAN Is Unverified

The main menu keeps a LAN multiplayer entry. I did not test multiple devices.

### Load Game Is Unverified

The entry exists, but I did not complete save and load regression tests.

### Touch Mapping

Touch input works on my phone. Different screen ratios and WebView versions may produce offset clicks.

### Fixed Port

AssetServer always uses port 8787. Changing the port changes the origin and invalidates the OPFS cache.

### Stale Process

If the app opens an old game after an update or rollback, stop the old process first:

```powershell
adb shell am force-stop com.dsh.ra2ghg
```

Confirm the process has exited, then launch the app again.

### Map Names and Version Strings

The interface is localized. Map names are content, and the version string and LAN identity ID remain in English or hexadecimal.

### APK Size

The APK is about 450 MB because it contains original MIX assets.

### Dormant Campaign Code

`src/game/campaign/*` remains in the repository. The stable build disables that code with a compile flag and a map filter.

---

## Building from Source

### Dependencies

- Windows; the current build script uses PowerShell
- JDK 17
- Android SDK: build-tools and platform android-36
- Bun
- Python 3
- 7-Zip

### Prepare Assets

Extract these files from the installer you own:

```text
ra2.mix
language.mix
multi.mix
theme.mix
expand01.mix
ecache01.mix
maps01.mix
maps02.mix
sidec01.mix
sidec02.mix
general.csf
rules.ini
ra2ts_l.webm
manifest.json
```

Place them in:

```text
android/assets/gameres/
```

Copy `general.csf` to:

```text
redalert2/public/general.csf
```

The stable build expects 14 files in `android/assets/gameres` and no `.MAP` campaign maps.

### Build the Web App

```powershell
$bun = 'path\to\bun.exe'
Set-Location redalert2
$env:RA2_CAMPAIGN = $null
& $bun run build
```

Copy `dist/` to `android/assets/web/`.

### Build the APK

```powershell
$env:ANDROID_SDK_ROOT = 'C:\path\to\android-sdk'
$env:JAVA_HOME = 'C:\path\to\jdk17'
$env:RA2_KEYSTORE_PASS = 'set-a-password'
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& .\android\build.ps1
```

Output:

```text
android/ra2ghg.apk
```

### Install

```powershell
adb install -r android\ra2ghg.apk
adb shell am start -n com.dsh.ra2ghg/.MainActivity
```

### Build Notes

- Do not use `aapt2 -A assets`. Windows writes backslash paths, and the phone returns 404.
- `pack_assets.py` uses Python `zipfile` and writes `/` paths.
- `.mix` files use `ZIP_STORED` to avoid decompression on every read.
- Do not change port 8787.
- Do not delete the signing keystore, or you cannot install updates over the existing app.
- `build.ps1` uses `$PSScriptRoot` and finds the toolchain through `ANDROID_SDK_ROOT` and `JAVA_HOME`.
- `RA2_KEYSTORE_PASS` is for local self-signing. Use your own keystore for distribution.

---

## Directory Layout

```text
.
├─ redalert2/
│  ├─ src/
│  ├─ public/
│  ├─ dist/
│  └─ vite.config.ts
├─ android/
│  ├─ src/com/dsh/ra2ghg/
│  ├─ assets/web/
│  ├─ assets/gameres/
│  ├─ build.ps1
│  ├─ pack_assets.py
│  └─ AndroidManifest.xml
├─ docs/
├─ tools/
├─ README.md
└─ README_EN.md
```

---

## Chinese Localization

Unit, building, and mission text comes from the official Chinese CSF.

`src/gui/i18n/zhUi.ts` translates hardcoded English in the main menu, settings, and LAN screens. The translator walks DOM text nodes, handles `title`, `placeholder`, and `data-r-tooltip`, and uses a `MutationObserver` for dynamic menus.

The default player name is “指挥官” (Commander). Map names, version strings, LAN identity IDs, and debug logs remain in English.

---

## Campaign

Campaign data exists:

- `mission.ini` contains 101 sections;
- 24 main campaign maps and 2 tutorial maps;
- 1,893 triggers;
- 1,181 TeamTypes;
- 1,002 ScriptTypes;
- 910 TaskForces.

The rewritten engine lacks a complete Team/Script runtime, campaign-specific trigger actions, AI production, mission objectives, EVA, and progress saves. Many maps also have their own scripts.

I built a proof of concept that loads TRN01 and ALL01, shows briefings, spawns teams, resolves win/loss, and advances to the next mission. It was still far from a playable 24-mission campaign, and the phone build showed a black screen. I dropped the campaign.

---

## Contributing

The project is archived. Bug reports, compatibility tests, documentation improvements, and PRs without original assets are welcome.

When opening an issue, include:

- Phone model and Android version;
- WebView version;
- Whether this is the first launch;
- Relevant `adb logcat` output;
- Screenshots or screen recordings.

Do not upload original assets, an APK containing assets, or commercial material in an issue or PR.

---

## License and Disclaimer

### Code License

Original code in this project uses the PolyForm Noncommercial License 1.0.0.

You may use, modify, and distribute it for personal, noncommercial purposes. Commercial use is prohibited, including selling the APK or source, paid downloads, ad-supported distribution, commercial hosting, cloud gaming, bundling, and commercial services based on this project.

Strictly speaking, this is source-available, not an OSI-approved open-source license.

### Documentation License

The README, documentation, and screenshots use CC BY-NC-SA 4.0.

### Original Game Assets

*Red Alert 2*, *Yuri's Revenge*, and related assets belong to Electronic Arts / Westwood Studios. *Glory of the Republic* belongs to its original mod authors.

This project does not contain, license, or distribute original game assets. You must own the game legally and extract the assets yourself.

Do not upload original assets or an APK containing them to GitHub.

### Upstream Code

The web engine comes from Chrono Divide / RA2Web code.

The PolyForm noncommercial terms apply to the Android shell, compatibility layer, localization, and build scripts added by this project. The upstream engine and libraries keep their original licenses.

If an upstream license conflicts with this project's noncommercial terms, the upstream license takes precedence. In all cases, do not use the combined work commercially.

Check the upstream LICENSE and copyright notices before publishing or redistributing.

### Disclaimer

This project is provided “as is”, without any express or implied warranty, including availability, freedom from errors, non-infringement, or fitness for a particular purpose.

You assume all risk for device heat, battery drain, stutter, crashes, data loss, corrupted saves, account or device issues, legal issues, and copyright disputes caused by using original assets. The author accepts no direct or indirect liability.

This project is not affiliated with Electronic Arts or Westwood Studios and has not been authorized or endorsed by them.

Nothing here is legal advice. Consult a lawyer for commercial use or redistribution.
