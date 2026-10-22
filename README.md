# 红警2 共和国之辉 · Android 轻量版

> **Skirmish-only / 仅遭遇战**
>
> 不是模拟器，也不是 Winlator。就是把原版游戏的数据喂给一套 TypeScript/WebGL 重写引擎，再套个 Android WebView 壳，让它在手机上能打遭遇战。

> **群友版一句话：**
> 能玩，但只有遭遇战；完整包和素材别找我要，版权问题，仓库只放代码。

---

## 太长不看

| 问题 | 答案 |
|---|---|
| 能不能在手机上玩？ | 能，只保证和作者手机环境相似的机器 |
| 有没有战役？ | 没有，已放弃 |
| 有没有音乐/影片？ | 没有，安装包数据本身是空占位 |
| 是不是 Wine / Box64？ | 不是，原生 WebView + 重写引擎 |
| 仓库有没有 APK/素材？ | 没有，只有代码和构建脚本 |
| 能不能商用？ | 不能，非商业许可 |
| 出问题谁负责？ | 自己承担，作者不负责 |

---

## 为什么仓库不公开完整游戏包 / APK

先说清楚：

> **这个仓库只公开代码、构建脚本和文档，不公开包含原版素材的完整 APK。**

原因不复杂：

1. **版权不在我手里**
   - `ra2.mix`、`language.mix`、`general.csf`、地图、SHP/VXL 都是 EA / Westwood 的东西；
   - 共和国之辉的素材归 MOD 原作者；
   - 我没资格把这些东西打包成“开源项目”往外发。

2. **完整包太大**
   - APK 约 450 MB，基本都是原版素材；
   - 不适合塞 Git，也不适合让每个 clone 都拖一遍；
   - `.gitignore` 已经排除了 APK、MIX、地图、CSF。

3. **不想惹麻烦**
   - 带素材的 APK 很容易被人二次打包、挂广告、拿去卖；
   - 对使用者和上游项目都不是好事。

所以仓库给的是：

- 重写引擎的 TypeScript 源码；
- Android WebView 壳、本地 HTTP 服务、构建脚本；
- 汉化、兼容性修复、开发文档；
- 从**你自己合法拥有的游戏**里提取资源的方法。

游戏自己准备，APK 自己构建。就这样。

---

## 这玩意到底是什么

一句话：**原版数据 + 重写引擎 + WebView 壳。**

不是把 `game.exe` 跑在 Android 上，也不是云游戏。具体流程：

1. 从你自己的《红警2》+《共和国之辉》里提取：
   - `ra2.mix`、`language.mix`、`multi.mix`、`sidec01/02.mix`
   - `rules.ini`、`art.ini`
   - `general.csf`
   - 地图、SHP、VXL、调色板
2. 用 TypeScript/WebGL 引擎读取这些数据；
3. 用 Android WebView 跑这套 Web 引擎；
4. 用本地 HTTP + OPFS 解决 WebView 的资源/持久化问题。

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
AssetServer（纯 Java，本地 HTTP）
http://127.0.0.1:8787
```

它不是 x86 模拟器：V8 直接跑 JS，WebGL 直接画，ARM 上不需要指令翻译。

---

## 为什么是本地 HTTP + OPFS

因为 WebView 的 `file://` 很不讲道理：

- opaque origin，OPFS / localStorage / SharedArrayBuffer 都不稳；
- Worker、fetch、模块加载容易被 CORS 卡；
- 引擎需要 Cross-Origin Isolation 才能用 `SharedArrayBuffer`。

所以壳里起一个只监听 `127.0.0.1` 的 HTTP 服务：

- 固定端口 **8787**；
- 带 COOP/COEP 头；
- `/` 返回 `assets/web`；
- `/gameres/*` 返回 `assets/gameres`。

这个端口不能随便改。改了 origin 就变，OPFS 里那 444 MB 资源直接作废，得重新 seed。

首次启动会把资源写进 OPFS，大约 **444 MB**，所以慢是正常的；后面启动直接复用。

---

## 开发初衷

小时候在电脑上打红警、打共和国之辉，现在手机性能早就溢出了，想随时开一局遭遇战，结果发现：

- 云游戏要网络、要会员，延迟还高；
- Winlator/Box64 又重又烫，操作也别扭；
- 各种整合包体积大，兼容性看命。

行吧，那就自己搞一个。

> **能在手机上方便地回味童年，随时打一局遭遇战，就够了。**

没打算做完整 remaster，也没打算还原战役。它就是一个能装进手机、点开就能玩的轻量版。

---

## 能玩什么

| 功能 | 状态 |
|---|---|
| Android 安装运行 | ✅ |
| 中文界面 | ✅ |
| 遭遇战 | ✅ |
| 地图选择 | ✅ |
| 敌人/国家/颜色/难度 | ✅ |
| 中国 MOD 单位/建筑 | ✅ |
| 建造菜单/放置建筑 | ✅ |
| 触摸操作 | ✅ |
| 采矿/战斗/基础 AI | ✅ |
| 读取存档 | ✅ 入口有，未充分验证 |
| 局域网联机 | ✅ 入口有，未充分验证 |
| 原版战役 | ❌ |
| 战役影片 | ❌ 数据源只有 5 字节占位 |
| 背景音乐 | ❌ `theme.mix` 是零占位 |
| 全部地图/后期平衡 | ⚠️ 没逐项回归 |

**它只有遭遇战。** 战役试过，没做完，放弃了。

---

## 最终效果

都是作者手机上实际跑的，不是渲染图。

### 主菜单

![手机主菜单：遭遇战 / 读取存档 / 局域网联机 / 选项](docs/images/main-menu.jpg)

- 全中文；
- 只有遭遇战、读取存档、局域网联机、选项；
- 没有战役按钮；
- 主菜单影片是 Bink 转出来的 WebM。

### 遭遇战

![手机遭遇战：盟军基地、中文 HUD、中国 MOD 单位](docs/images/gameplay.jpg)

- 手机横屏全屏；
- 中文 HUD / 建造菜单；
- 中国 MOD 单位与建筑；
- 触摸选中、部署 MCV、建造、采矿、战斗；
- 截图来自 1272×2800 的真机屏幕。

再说一遍：这不是 Wine/Box64 窗口，也不是云游戏画面。

---

## 使用方式

### 方式一：自己构建（推荐，也是仓库唯一公开方式）

仓库只有代码，没有原版资源，也没有带素材的 APK。

你需要自己准备：

- 《红色警戒2》原版；
- 《共和国之辉》MOD；
- 对应的安装包/解包目录。

然后按下面“从源码构建”生成：

```text
android/ra2ghg.apk
```

素材来自你自己的游戏，风险最低，也符合这个项目的非商业许可。

### 方式二：别人构建的个人测试 APK

> 原版素材版权归 EA/Westwood。  
> **不要公开分发带 `ra2.mix`、`language.mix` 的 APK。**  
> 个人测试包只建议给自己拥有的游戏用。

手机要求：

- Android 8.0+（minSdk 26）；
- arm64-v8a；
- 建议 4 GB 以上内存；
- 至少 2 GB 可用空间；
- 较新的 Android System WebView。

安装后第一次启动：

- 会往 WebView 的 OPFS 写约 444 MB；
- 慢是正常的，保持前台、亮屏；
- 后面启动复用同一份数据。

进主菜单：

- 遭遇战；
- 读取存档；
- 局域网联机；
- 选项。

遭遇战里选中国、选地图/敌人/颜色/难度，开局触摸选中 MCV，部署建造场，然后正常建造。

---

## 兼容性：别指望所有手机都完美

> **这个 App 大概率只在和作者手机环境相似的机器上才能完美运行。**

作者真机：

- 一加 Ace 5 至尊版（`PLC110`）
- Android 16 / API 36
- arm64-v8a，MediaTek MT6991
- 1272×2800，560 dpi
- WebView 154
- 建议 12 GB 内存，约 50 GB 可用空间

为什么挑机器：

- 依赖 Android System WebView 的 WebGL/Worker/OPFS；
- 不同厂商 WebView、GPU 驱动、屏幕比例、触摸映射都可能不一样；
- 固定 8787 端口、OPFS 首次 seeding、HUD 缩放都对环境敏感；
- 作者没做多机型系统测试。

其他手机可能：

- 首帧黑屏/花屏；
- WebGL 创建失败；
- 触摸位置偏移；
- 字体/UI 过大或过小；
- 帧率低、发热、内存不足；
- 首次 seeding 卡住。

能启动不代表能完美运行，以你自己真机为准。

---

## 已知 Bug / 限制

项目已归档，下面这些不承诺修：

1. **首次启动很慢**
   - 要写约 444 MB 到 OPFS；
   - 看起来像卡在“加载中”，等就完了。

2. **更新后第一次启动也可能慢**
   - 新资源要补写 OPFS；
   - 这时候别清数据，不然重新 seed。

3. **只有遭遇战**
   - 没战役、没影片、没音乐。

4. **机型/WebView 兼容性**
   - 只在作者手机上完整验证；
   - 其他机器可能黑屏、掉帧、触摸错位、进不去。

5. **地图/科技兼容**
   - 部分地图引用了不支持的科技；
   - 部分 MOD 单位/建筑后期表现异常；
   - 没逐张地图、逐个单位回归。

6. **LAN 未充分验证**
   - 入口保留，没多机联调，不保证能用。

7. **读取存档未充分验证**
   - 入口有，没做完整存档/读档回归。

8. **触摸**
   - 作者手机上正常；
   - 不同屏幕比例/WebView 可能点不中、HUD 偏移。

9. **固定端口 8787**
   - 不能随便改；
   - 改了 origin 变，OPFS 资源全失效，要重新 seed。

10. **旧进程残留**
    - 更新/回滚后如果直接进旧游戏，不一定是 APK 逻辑；
    - 先 `adb shell am force-stop com.dsh.ra2ghg`，确认进程没了再启动。

11. **地图名/版本号/ID 仍是英文**
    - UI 已汉化；
    - 地图名属于内容/专有名词；
    - 版本号和 LAN 身份 ID 保留英文/十六进制。

12. **APK 体积大**
    - 约 450 MB；
    - 因为包含原版 MIX；
    - 不适合低存储设备。

13. **战役代码是休眠的**
    - `src/game/campaign/*` 还在；
    - 稳定版通过编译开关和地图过滤关掉了；
    - 别在稳定版里重新启用。

---

## 群友版 Q&A

**Q：为什么没战役？**  
A：引擎没补完，不是藏私；Team/Script、触发器、目标、EVA 都差得远，真机还黑屏，收益太低，砍了。

**Q：为什么没音乐？**  
A：安装包里的 `theme.mix` 是零占位，不是我不加，是数据本身没有。

**Q：为什么没影片？**  
A：`movies01/02.mix` 只有 5 字节，同样没数据。

**Q：为什么我的手机黑屏？**  
A：WebView/GPU/屏幕比例都可能背锅；这玩意只保证作者手机。

**Q：能不能商用？**  
A：不能。代码是非商业许可，素材也不是我的。

**Q：为什么仓库没有 APK？**  
A：版权 + 体积 + 不想被拿去卖，见开头。

---

## 从源码构建

### 依赖

- Windows（当前脚本是 PowerShell）
- JDK 17
- Android SDK：build-tools、platform android-36
- Bun
- Python 3
- 7-Zip（解原版安装包）

### 1. 准备资源

从你合法拥有的安装包提取：

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
ra2ts_l.webm（可选，主菜单影片）
manifest.json
```

放到：

```text
android/assets/gameres/
```

`general.csf` 再复制一份到：

```text
redalert2/public/general.csf
```

Vite 构建会把它复制到 `dist/general.csf`。仓库出于版权原因没有提交这个文件。

注意：

- 稳定版不要放 `.MAP` 战役地图；
- `android/assets/gameres` 应该是 14 个文件、0 个 `.MAP`；
- 不要把 `gameres-export/` 整个复制进去。

### 2. 构建 Web

```powershell
$bun = 'path\to\bun.exe'
Set-Location redalert2
$env:RA2_CAMPAIGN = $null
& $bun run build
```

把 `dist/` 同步到：

```text
android/assets/web/
```

### 3. 构建 APK

```powershell
$env:ANDROID_SDK_ROOT = 'C:\path\to\android-sdk'
$env:JAVA_HOME = 'C:\path\to\jdk17'
$env:RA2_KEYSTORE_PASS = 'set-a-password'  # 可省略，默认 ra2ghg-local-dev
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& .\android\build.ps1
```

输出：

```text
android/ra2ghg.apk
```

### 4. 安装

```powershell
adb install -r android\ra2ghg.apk
adb shell am start -n com.dsh.ra2ghg/.MainActivity
```

### 构建注意事项

- **不要用 `aapt2 -A assets`**：Windows 会写反斜杠路径，手机端直接 404。
- `pack_assets.py` 用 Python `zipfile` 以 `/` 路径打包。
- `.mix` 以 `ZIP_STORED` 存放，避免每次读取都解压。
- 不要改端口 8787。
- 不要删签名 keystore，不然不能覆盖安装。
- `build.ps1` 用 `$PSScriptRoot`，通过 `ANDROID_SDK_ROOT` / `JAVA_HOME` 找工具链。
- `RA2_KEYSTORE_PASS` 只用于本地自签名；正式分发请用自己的 keystore。

---

## 目录结构

```text
.
├─ redalert2/                    # TypeScript/Web 引擎与 UI
│  ├─ src/
│  ├─ public/
│  ├─ dist/                      # 构建产物
│  └─ vite.config.ts
├─ android/
│  ├─ src/com/dsh/ra2ghg/        # MainActivity / AssetServer
│  ├─ assets/web/                # Web 构建产物
│  ├─ assets/gameres/            # 稳定版资源
│  ├─ build.ps1
│  ├─ pack_assets.py
│  └─ AndroidManifest.xml
├─ docs/
├─ tools/
└─ README.md
```

仓库结构可能和实际略有差异，以实际为准。

---

## 汉化

- 单位、建筑、任务文本来自官方中文 CSF；
- 主菜单/设置/LAN 等硬编码英文由 `src/gui/i18n/zhUi.ts` 做 DOM 翻译；
- 默认玩家名“指挥官”；
- 保留英文：地图名、版本号、LAN 身份 ID、调试日志。

---

## 为什么没有战役

战役数据其实在：

- `mission.ini` 101 个 section；
- 24 张主战役 + 2 张教学；
- 1893 个触发器、1181 个 TeamTypes、1002 个 ScriptTypes、910 个 TaskForces。

但重写引擎缺：

- 完整 Team/Script 运行时；
- 战役专用 trigger action/event；
- AI 生产/AI triggers；
- 任务目标、EVA、下一关、进度存档；
- 大量地图特有脚本。

我做过 PoC：能加载 TRN01/ALL01、显示简报、刷队、判胜负、进下一关。但离“24 关可通关”差太远，真机还黑屏，所以砍了。

---

## 贡献

项目归档了，但还欢迎：

- Bug 报告；
- 兼容性测试；
- 代码整理/文档改进；
- 不含原版素材的 PR。

提 Issue 请附：

- 手机型号、Android 版本；
- WebView 版本；
- 是否首次启动；
- 相关 `adb logcat`；
- 截图/录屏。

**不要**在 Issue/PR 里传：

- `ra2.mix`、`language.mix` 等原版资源；
- 含原版资源的 APK；
- 任何商业素材。

---

## 版权、许可与免责声明

### 代码许可

本项目**原创代码**使用：

> **PolyForm Noncommercial License 1.0.0**

- 允许个人、非商业使用、修改、分发；
- **禁止任何商业用途**，包括但不限于：
  - 售卖 APK/源码；
  - 付费下载/会员制；
  - 广告变现；
  - 商业托管/云游戏；
  - 捆绑销售；
  - 以本项目为基础提供商业服务。
- 严格说这是 **source-available（源码公开）**，不是 OSI 定义的开源许可证。

### 文档许可

README、文档、截图采用：

> **CC BY-NC-SA 4.0**

### 原版素材

- 《红色警戒2》《尤里的复仇》及相关素材版权归 **Electronic Arts / Westwood Studios**；
- 《共和国之辉》MOD 版权归其原作者；
- 本项目不包含、不授权、不分发原版素材；
- 你需要自己合法拥有原版游戏并提取资源；
- 不要把原版素材或含素材的 APK 上传到 GitHub。

### 上游代码

本项目并非从零重写全部引擎：Web 引擎来自 Chrono Divide / RA2Web 系代码。

- PolyForm 非商业条款只适用于本项目新增的 Android 壳、适配层、汉化、构建脚本等原创部分；
- 上游引擎/库仍遵循其原有许可证；
- 如果上游许可证和本项目的非商业条款冲突，以上游许可证为准；
- 无论上游许可证如何，**不得把整个组合作商业使用**；
- 发布/再分发前请自行核对上游 LICENSE 和版权声明。

### 免责声明

本项目按 **“现状（AS IS）”** 提供，不提供任何明示或暗示的担保，包括但不限于可用性、无错误、不侵权、适用于特定用途。

使用本项目造成的任何后果，包括但不限于设备发热/耗电/卡顿/崩溃、数据丢失、存档损坏、账号/设备风险、法律风险、因使用原版素材产生的版权纠纷，由使用者自行承担。作者不承担任何直接或间接责任。

**本项目与 Electronic Arts、Westwood Studios 没有任何关联，也未获得其授权或背书。**

以上内容不构成法律建议；涉及商业使用/再分发请咨询专业律师。

---

## Credits

- **Westwood Studios / Electronic Arts**：原版《红色警戒2》
- **《共和国之辉》MOD 原作者**
- **Chrono Divide / RA2Web**：重写引擎与社区
- **Three.js、React、Vite、Bun、7z-wasm、FFmpeg、Playwright** 等开源项目
- 所有参与测试、反馈和提供思路的玩家

---

## English Summary

A lightweight, **skirmish-only** Android port of *Command & Conquer: Red Alert 2* + the *Glory of the Republic* mod.

It does **not** emulate the original x86 executable. It reuses the original game data (MIX/INI/CSF/SHP/VXL/maps) with a TypeScript/WebGL engine running inside an Android WebView, served through a loopback HTTP server and cached in OPFS.

- Chinese UI, skirmish, China mod units, touch controls
- No campaign, no music, no movies
- Not a Wine/Box64/Winlator container
- Tested only on the author's phone (OnePlus Ace 5 Ultimate, Android 16, WebView 154)
- **Non-commercial use only** (PolyForm Noncommercial 1.0.0)
- No warranty; use at your own risk
- Original game assets are copyrighted by EA/Westwood; this repository does not grant any rights to them

Fan project made for nostalgia: just enough to play a skirmish on a phone.
