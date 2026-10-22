# 红警2 共和国之辉 Android 轻量版

> **Skirmish-only / 仅遭遇战**
>
>仅遭遇战。项目把《红色警戒2》和《共和国之辉》的数据交给一套 TypeScript/WebGL 引擎，在 Android WebView 里运行。

>仓库提供代码、构建脚本和文档。游戏素材需要你从自己拥有的原版游戏中提取。

---

## 开发起因

小时候经常在电脑上玩《红警2共和国之辉》。现在手机性能早就足够了，想随时开一局遭遇战，结果发现Winlator 和 Box64 体积大、不流畅，触摸操作别扭。整合包兼容性不稳定，干脆自己做个移植。

> **能在手机上方便地回味童年，随时打一局遭遇战，就够了。**

没打算做完整 remaster，也没打算还原战役。它就是一个能装进手机、点开就能玩的轻量版。

---

## 功能

1. 遭遇战
2. 地图、敌人、国家、颜色、难度自定义
3. 包含中国单位
4. 建造菜单与放置建筑，采矿、战斗、基础敌人AI
5. 适配了触摸操作
6. 读取存档和局域网联机(目前入口存在，但未充分验证)

---

## 运行效果

截图来自作者手机实机，不是AI。

### 主菜单

![手机主菜单：遭遇战、读取存档、局域网联机、选项](docs/images/main-menu.jpg)

主菜单为中文，包含遭遇战、读取存档、局域网联机和选项。没有战役按钮。菜单影片从 Bink 转成 WebM。

### 遭遇战

![手机遭遇战：盟军基地、中文 HUD、中国 MOD 单位](docs/images/gameplay.jpg)

游戏横屏全屏。HUD 和建造菜单为中文，中国 MOD 单位和建筑可用。触摸可以选中单位、部署 MCV、建造、采矿和战斗。

截图来自 1272×2800 手机屏幕。

---

## 安装

### 自己构建

仓库不发布带素材的 APK。你需要准备：

- 《红色警戒2》原版；
- 《共和国之辉》MOD；
- 原版安装包或解包目录。

按“从源码构建”生成 `android/ra2ghg.apk`。素材来自你自己的游戏，风险最低。

### 使用个人测试 APK

如果你拿到别人构建的个人测试包：

- 手机需要 Android 8.0 或更高版本、arm64 CPU、4 GB 以上内存；
- 至少预留 2 GB 存储空间；
- 安装时需要允许未知来源应用；
- 首次启动写入约 444 MB 资源，保持前台和亮屏；
- 进入遭遇战，选择中国、地图、敌人、颜色和难度；
- 触摸选中 MCV，部署建造场，然后建造。

不要公开分发包含 `ra2.mix`、`language.mix` 等素材的 APK。

---

## 兼容性

只在我的手机上完成了实机验证：

- 一加 Ace 5 至尊版，型号 `PLC110`
- Android 16 / API 36
- arm64-v8a，MediaTek MT6991
- 1272×2800，560 dpi
- WebView 154
- 12 GB 内存，约 50 GB 可用空间

这个 App 依赖 Android System WebView 的 WebGL、Worker 和 OPFS。不同厂商的 WebView、GPU 驱动、屏幕比例和触摸映射会产生不同结果。没有做多机型测试。

其他手机可能出现：

- 首帧黑屏或花屏；
- WebGL 上下文创建失败；
- 触摸位置偏移；
- 字体和 UI 尺寸异常；
- 帧率低、发热、内存不足；
- 首次 seeding 卡住。

能启动不代表能稳定运行。

---

## 仓库内容

```text
redalert2/     TypeScript/WebGL 引擎、UI、汉化
android/       WebView 壳、本地 HTTP 服务、构建脚本
docs/          截图和说明
tools/         调试脚本
README.md
LICENSE
```

仓库不包含 APK、`ra2.mix`、`language.mix`、`general.csf`、地图、SHP 或 VXL。

---

## 不公开完整包的原因

### 版权

`ra2.mix`、`language.mix`、`general.csf`、地图和模型归 EA / Westwood 所有。《共和国之辉》的素材归 MOD 原作者。我没有权利以开源名义重新分发这些文件。

### 体积

完整 APK 约 450 MB，其中大部分是原版素材。这个体积不适合放进 Git 仓库。

### 分发风险

带素材的 APK 容易被二次打包、挂广告或售卖。上传这类 APK 会给使用者和上游项目带来麻烦。

---

## 项目范围

项目实现遭遇战、中文界面、中国 MOD 单位、触摸操作、建造和基础 AI。

战役、战役影片、背景音乐不在范围内。`movies01.mix` 和 `movies02.mix` 只有 5 字节占位，`theme.mix` 是零占位。

---

## 实现方式

原版游戏把规则、地图、文本和美术存放在 MIX、INI、CSF、SHP、VXL 文件中。项目保留这些数据，用 TypeScript 重写游戏逻辑，用 WebGL 绘制画面。

Android 端运行一个 WebView。WebView 通过本地 HTTP 服务读取 APK 里的资源，再把资源写入 OPFS。

```text
APK
├─ assets/web/       React + TypeScript 引擎
└─ assets/gameres/   原版 MIX / INI / CSF / SHP / VXL
        │
        ▼
Android WebView（Chromium / V8）
├─ TypeScript 游戏逻辑
├─ WebGL / Three.js 渲染
├─ Web Worker / WASM 解码
└─ OPFS 资源缓存
        ▲
        │ fetch
AssetServer（Java，本地 HTTP）
http://127.0.0.1:8787
```

项目不执行原版 `game.exe`，不使用 Wine、Box64 或 Winlator。V8 直接运行 JavaScript，WebGL 直接绘制。

### 本地 HTTP 与 OPFS

WebView 的 `file://` 页面没有稳定的 OPFS、localStorage 和 SharedArrayBuffer。Worker、fetch 和模块加载也会遇到 CORS 限制。

Android 壳启动一个只监听 `127.0.0.1` 的 HTTP 服务，端口固定为 8787，并设置 COOP/COEP 响应头。页面从 `http://127.0.0.1:8787/` 加载。

端口不能改。端口变化会改变 origin，OPFS 里的资源随之失效。

首次启动把约 444 MB 资源写入 OPFS。后续启动复用这份数据。

---

## 已知问题

项目已归档，以下问题不承诺修复。

### 首次启动慢

应用需要把约 444 MB 资源写入 OPFS。界面会停在“加载中”，等待完成即可。

### 只有遭遇战

项目没有战役、影片和音乐，这些文件已经丢失损坏，只能进行遭遇战

### 机型兼容性

目前只验证了一台手机。其他机型可能黑屏、掉帧、触摸偏移或无法进入游戏。

### 地图与科技兼容

有部分地图引用不支持的科技。部分 MOD 单位和建筑在后期表现异常。还没有逐张地图、逐个单位回归。

### LAN 未验证

主菜单保留局域网联机入口。没有做多机联调。

### 读取存档未验证

入口存在，不过没有完成存档和读档回归。

### 触摸映射

在我手机上触摸正常。不同屏幕比例和 WebView 版本可能出现点击偏移。

### 固定端口

AssetServer 固定使用 8787 端口。修改端口会改变 origin，OPFS 资源失效。

### 旧进程

更新或回滚后，如果应用直接进入旧游戏，先结束旧进程：

```powershell
adb shell am force-stop com.dsh.ra2ghg
```

确认进程退出后再启动。

### 地图名与版本号

界面已经汉化。地图名属于内容，版本号和 LAN 身份 ID 保留英文或十六进制。

### APK 体积

APK 约 450 MB，包含原版 MIX 资源。

### 休眠的战役代码

`src/game/campaign/*` 仍在仓库中。稳定版通过编译开关和地图过滤关闭了这些代码。

---

## 从源码构建

### 依赖

- Windows，当前构建脚本使用 PowerShell
- JDK 17
- Android SDK：build-tools、platform android-36
- Bun
- Python 3
- 7-Zip

### 准备资源

从你拥有的安装包提取：

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

放入：

```text
android/assets/gameres/
```

把 `general.csf` 再复制一份到：

```text
redalert2/public/general.csf
```

稳定版的 `android/assets/gameres` 应包含 14 个文件，不放 `.MAP` 战役地图。

### 构建 Web

```powershell
$bun = 'path\to\bun.exe'
Set-Location redalert2
$env:RA2_CAMPAIGN = $null
& $bun run build
```

把 `dist/` 复制到 `android/assets/web/`。

### 构建 APK

```powershell
$env:ANDROID_SDK_ROOT = 'C:\path\to\android-sdk'
$env:JAVA_HOME = 'C:\path\to\jdk17'
$env:RA2_KEYSTORE_PASS = 'set-a-password'
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& .\android\build.ps1
```

输出：

```text
android/ra2ghg.apk
```

### 安装

```powershell
adb install -r android\ra2ghg.apk
adb shell am start -n com.dsh.ra2ghg/.MainActivity
```

### 构建注意事项

- 不要使用 `aapt2 -A assets`。Windows 会写入反斜杠路径，手机端会返回 404。
- `pack_assets.py` 使用 Python `zipfile` 以 `/` 路径打包。
- `.mix` 使用 `ZIP_STORED`，避免每次读取都解压。
- 不要修改 8787 端口。
- 不要删除签名 keystore，否则无法覆盖安装。
- `build.ps1` 使用 `$PSScriptRoot`，通过 `ANDROID_SDK_ROOT` 和 `JAVA_HOME` 查找工具链。
- `RA2_KEYSTORE_PASS` 用于本地自签名。正式分发请使用自己的 keystore。

---

## 目录结构

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
└─ README.md
```

---

## 汉化

单位、建筑和任务文本来自官方中文 CSF。

主菜单、设置和 LAN 的硬编码英文由 `src/gui/i18n/zhUi.ts` 翻译。翻译层遍历 DOM 文本节点，处理 `title`、`placeholder` 和 `data-r-tooltip`，并用 `MutationObserver` 监听动态菜单。

默认玩家名为“指挥官”。地图名、版本号、LAN 身份 ID 和调试日志保留英文。

---

## 战役

战役数据存在：

- `mission.ini` 包含 101 个 section；
- 24 张主战役地图和 2 张教学地图；
- 1893 个触发器；
- 1181 个 TeamTypes；
- 1002 个 ScriptTypes；
- 910 个 TaskForces。

重写引擎缺少完整 Team/Script 运行时、战役专用 trigger action、AI 生产、任务目标、EVA 和进度存档。大量地图还有独立脚本。

做过 PoC：加载 TRN01 和 ALL01、显示简报、刷队、判胜负、进入下一关。距离 24 关可通关仍有很大差距，真机还出现黑屏，项目最终放弃战役。

---

## 贡献

项目已归档。仍然欢迎 Bug 报告、兼容性测试、文档改进和不含原版素材的 PR。

提交 Issue 时请附：

- 手机型号和 Android 版本；
- WebView 版本；
- 是否首次启动；
- 相关 `adb logcat`；
- 截图或录屏。

不要在 Issue 或 PR 中上传原版资源、含资源的 APK 或商业素材。

---

## 许可与免责声明

### 代码许可

本项目原创代码使用 PolyForm Noncommercial License 1.0.0。

允许个人、非商业使用、修改和分发。禁止商业用途，包括售卖 APK 或源码、付费下载、广告变现、商业托管、云游戏、捆绑销售，以及基于本项目提供商业服务。

严格来说，这是 source-available，不是 OSI 定义的开源许可证。

### 文档许可

README、文档和截图使用 CC BY-NC-SA 4.0。

### 原版素材

《红色警戒2》《尤里的复仇》及相关素材版权归 Electronic Arts / Westwood Studios。《共和国之辉》MOD 版权归其原作者。

本项目不包含、不授权、不分发原版素材。你需要自己合法拥有原版游戏并提取资源。

不要把原版素材或含素材的 APK 上传到 GitHub。

### 上游代码

Web 引擎来自 Chrono Divide / RA2Web 系代码。

PolyForm 非商业条款适用于本项目新增的 Android 壳、适配层、汉化和构建脚本。上游引擎和库遵循其原有许可证。

如果上游许可证与本项目的非商业条款冲突，以上游许可证为准。无论上游许可证如何，不得把整个组合作商业使用。

发布或再分发前请核对上游 LICENSE 和版权声明。

### 免责声明

本项目按“现状”提供，不提供任何明示或暗示的担保，包括可用性、无错误、不侵权和适用于特定用途。

使用本项目造成的设备发热、耗电、卡顿、崩溃、数据丢失、存档损坏、账号或设备风险、法律风险，以及因使用原版素材产生的版权纠纷，由使用者自行承担。作者不承担直接或间接责任。

本项目与 Electronic Arts、Westwood Studios 没有关联，也未获得其授权或背书。

以上内容不构成法律建议。涉及商业使用或再分发，请咨询专业律师。
