/**
 * Lightweight visible-UI translator.
 *
 * The game engine's CSF data is already Chinese, but many React menus and
 * debug screens hard-code English labels. Translating all of those at the
 * source would touch dozens of unrelated components, so this module translates
 * the rendered DOM (text nodes and the common tooltip/title attributes) and
 * keeps watching for dynamically created dialogs/screens.
 */

const EXACT: Record<string, string> = {
    'Skirmish': '遭遇战',
    'Campaign (Debug)': '战役（测试）',
    '战役（Debug）': '战役（测试）',
    'Load Game': '读取存档',
    'LAN Multiplayer': '局域网联机',
    'Replays': '录像',
    'Info & Credits': '信息与制作',
    'Test Tools': '测试工具',
    'Live Interaction': '直播互动',
    'Mods': '模组',
    'Fullscreen': '全屏',
    'Options': '选项',
    'Back': '返回',
    'Cancel': '取消',
    'Close': '关闭',
    'OK': '确定',
    'Confirm': '确认',
    'Apply': '应用',
    'Start Game': '开始游戏',
    'Create Room': '创建房间',
    'Join Room': '加入房间',
    'Player Info': '玩家信息',
    'Player Name': '玩家名称',
    'Current Identity': '当前身份',
    'Browser Support': '浏览器支持',
    'WebRTC available': '实时通信可用',
    'Unavailable': '不可用',
    'Last Room': '上次房间',
    'Last Mode': '上次模式',
    'No records yet': '暂无记录',
    'Recent Games': '最近游戏',
    'This name is used in the room member list, chat, and your player slot once the game starts.':
        '这个名字会用于房间成员列表、聊天，以及游戏开始后的玩家槽位。',
    'Use the menu on the right to create or join a room; this panel only holds your LAN profile.':
        '使用右侧菜单创建或加入房间；此面板只保存你的局域网资料。',
    'Games you play will be recorded here automatically.':
        '你玩过的游戏会自动记录在这里。',
    'Use the menu on the right to create or join a room. After you finish a multiplayer game, it will show up here.':
        '使用右侧菜单创建或加入房间。完成一局多人游戏后，它会显示在这里。',
    'Frame Limit': '帧率限制',
    'Performance': '性能',
    'Raycast Helper Reuse': '射线辅助重用',
    'Entity Intersect Traversal': '实体相交遍历',
    'Map Tile Hit Test': '地图格子命中测试',
    'World Viewport Cache': '世界视口缓存',
    'World Sound Loop Cache': '世界声音循环缓存',
    'Telemetry & Benchmarks': '遥测与基准测试',
    'Joystick': '摇杆',
    'Play a single-player skirmish against the AI': '与电脑进行单机遭遇战',
    'Choose a campaign mission': '选择战役任务',
    'Continue a saved skirmish match': '继续已保存的遭遇战',
    'Exchange SDP manually to establish a LAN P2P data channel': '手动交换连接信息以建立局域网点对点连接',
    'Choose a mode and map first, then enter the waiting room': '先选择模式和地图，再进入等待房间',
    'Scan or paste QR code content to join an existing room': '扫描或粘贴二维码内容加入现有房间',
    'Return to the main menu': '返回主菜单',
    'Caps how many frames are drawn per second. Lower values reduce battery drain and heat; the game speed is unaffected.':
        '限制每秒渲染的帧数。较低的值可减少耗电和发热，游戏速度不受影响。',
    'Player': '玩家',
    'AI': '电脑',
    'None': '无',
    'Random': '随机',
    'Easy': '简单',
    'Medium': '中等',
    'Hard': '困难',
    'Brutal': '残酷',
    'Yes': '是',
    'No': '否',
    'On': '开',
    'Off': '关',
    'Enabled': '已启用',
    'Disabled': '已禁用',
    'Loading...': '载入中...',
    'Loading': '载入中',
    'Preparing game files...': '正在准备游戏文件...',
    'Victory': '胜利',
    'Defeat': '失败',
    'Game Over': '游戏结束',
    'Resign': '投降',
    'Continue': '继续',
    'Return to Main Menu': '返回主菜单',
    'Save': '保存',
    'Load': '读取',
    'Delete': '删除',
    'No saved games': '暂无存档',
    'Game Saved': '游戏已保存',
    'Game saved': '游戏已保存',
    'Connection Lost': '连接断开',
    'You have been disconnected': '你已断开连接',
    'Error': '错误',
    'Unknown Error': '未知错误',
    'Failed': '失败',
};

const PATTERNS: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^Player\s*(\d+)$/i, (match) => `玩家 ${match[1]}`],
    [/^AI\s*(\d+)$/i, (match) => `电脑 ${match[1]}`],
    [/^Player-([A-Z0-9]+)$/i, (match) => `玩家-${match[1]}`],
    [/^(\d+)\s*FPS$/i, (match) => `${match[1]} 帧`],
    [/^(\d+)\s*fps$/i, (match) => `${match[1]} 帧`],
];

function translateCore(core: string): string {
    const exact = EXACT[core];
    if (exact) {
        return exact;
    }
    for (const [pattern, replace] of PATTERNS) {
        const match = core.match(pattern);
        if (match) {
            return replace(match);
        }
    }
    return core;
}

export function translateUiText(value: string): string {
    if (!value || !/[A-Za-z]/.test(value)) {
        return value;
    }
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) {
        return value;
    }
    const translated = translateCore(match[2]);
    return translated === match[2] ? value : `${match[1]}${translated}${match[3]}`;
}

const ATTRIBUTES = ['title', 'placeholder', 'data-r-tooltip', 'aria-label'];
const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);

function translateAttributes(element: Element): void {
    for (const attribute of ATTRIBUTES) {
        const value = element.getAttribute(attribute);
        if (!value) {
            continue;
        }
        const translated = translateUiText(value);
        if (translated !== value) {
            element.setAttribute(attribute, translated);
        }
    }
}

function translateTextNode(node: Text): void {
    const value = node.nodeValue;
    if (!value) {
        return;
    }
    const translated = translateUiText(value);
    if (translated !== value) {
        node.nodeValue = translated;
    }
}

function translateSubtree(root: Node): void {
    if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root as Text);
        return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) {
        return;
    }
    const element = root as Element;
    if (SKIPPED_TAGS.has(element.tagName)) {
        return;
    }
    translateAttributes(element);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text);
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
            translateAttributes(node as Element);
        }
    }
}

export function installChineseUi(): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return;
    }
    const marker = '__ra2ChineseUiInstalled';
    if ((window as any)[marker]) {
        return;
    }
    (window as any)[marker] = true;
    const start = () => {
        if (!document.body) {
            setTimeout(start, 50);
            return;
        }
        translateSubtree(document.body);
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                    translateTextNode(mutation.target as Text);
                }
                else if (mutation.type === 'attributes') {
                    translateAttributes(mutation.target as Element);
                }
                else {
                    mutation.addedNodes.forEach((node) => translateSubtree(node));
                }
            }
        });
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRIBUTES,
        });
    };
    start();
}
