import { Screen } from '../../Controller';
import { MainMenuScreenType } from '../../ScreenType';
import { MainMenuController } from '../MainMenuController';
import { Strings } from '../../../../data/Strings';
import { MusicType } from '../../../../engine/sound/Music';
import { MessageBoxApi } from '../../../component/MessageBoxApi';
import { FullScreen } from '../../../FullScreen';
import { getHumanReadableKey } from '@/gui/screen/options/component/getHumanReadableKey';
import { isNativeShell } from '@/shell/iosSeed';
import { startCampaignMission, CAMPAIGN_MISSIONS } from '@/game/campaign/CampaignLauncher';
import { isCampaignMissionCompleted } from '@/game/campaign/CampaignProgress';

declare const __RA2_CAMPAIGN__: boolean;
interface SidebarButton {
    label: string;
    tooltip?: string;
    disabled?: boolean;
    isBottom?: boolean;
    onClick: () => void | Promise<void>;
}
export class HomeScreen implements Screen {
    private strings: Strings;
    private messageBoxApi: MessageBoxApi;
    private appVersion: string;
    private storageEnabled: boolean;
    private quickMatchEnabled: boolean;
    private fullScreen?: FullScreen;
    private controller?: MainMenuController;
    private rootController?: any;
    private mapList?: any;
    private gameModes?: any;
    public title: string;
    public musicType: MusicType;
    constructor(strings: Strings, messageBoxApi: MessageBoxApi, appVersion: string, storageEnabled: boolean = false, quickMatchEnabled: boolean = false, fullScreen?: FullScreen, rootController?: any, mapList?: any, gameModes?: any) {
        this.strings = strings;
        this.messageBoxApi = messageBoxApi;
        this.appVersion = appVersion;
        this.storageEnabled = storageEnabled;
        this.quickMatchEnabled = quickMatchEnabled;
        this.fullScreen = fullScreen;
        this.rootController = rootController;
        this.mapList = mapList;
        this.gameModes = gameModes;
        this.title = this.strings.get("GUI:MainMenu") || "Main Menu";
        this.musicType = MusicType.Intro;
    }
    setController(controller: MainMenuController): void {
        this.controller = controller;
    }
    onEnter(): void {
        console.log('[HomeScreen] Entering home screen');
        // The native (iOS) build ships a focused menu: Skirmish, Load Game,
        // LAN and Options. The other entries stay available in web builds
        // (and their underlying systems remain in the bundle — saves are
        // built on the replay machinery).
        const nativeShell = isNativeShell();
        const campaignAvailable = Boolean(__RA2_CAMPAIGN__ && this.mapList?.getAll?.().some((entry: any) => {
            const fileName = String(entry.fileName ?? '').toLowerCase();
            return CAMPAIGN_MISSIONS.some((mission) =>
                fileName === mission.map.toLowerCase() ||
                fileName === `${mission.map.toLowerCase()}.map`);
        }));
        const buttons: SidebarButton[] = [
            {
                label: 'Skirmish',
                tooltip: 'Play a single-player skirmish against the AI',
                onClick: async () => {
                    console.log('[HomeScreen] Skirmish clicked');
                    try {
                        if (this.controller) {
                            this.controller.goToScreen(MainMenuScreenType.Skirmish);
                        }
                    }
                    catch (error) {
                        console.error('[HomeScreen] Failed to navigate to Skirmish:', error);
                        await this.messageBoxApi.alert('Skirmish - Under Development\n\nThe basic framework is in place, but the following components still need work:\n• Game rules system\n• Map loader\n• AI opponent system\n• Game mode manager', this.strings.get('GUI:OK') || 'OK');
                    }
                }
            },
            ...(campaignAvailable ? [{
                label: 'Campaign (Debug)',
                tooltip: 'Choose a campaign mission',
                onClick: () => {
                    console.log('[HomeScreen] Campaign debug clicked');
                    if (!this.rootController || !this.mapList || !this.gameModes) {
                        void this.messageBoxApi.alert('Campaign loader is not available in this build.', this.strings.get('GUI:OK') || 'OK');
                        return;
                    }
                    this.openCampaignMenu();
                }
            }] : []),
            {
                label: 'Load Game',
                tooltip: 'Continue a saved skirmish match',
                onClick: () => {
                    console.log('[HomeScreen] Load Game clicked');
                    if (this.controller) {
                        this.controller.pushScreen(MainMenuScreenType.LoadGame);
                    }
                }
            },
            ...(!nativeShell
                ? [
                    {
                        label: 'Live Interaction',
                        tooltip: 'Enter live interaction mode, where viewer events such as joins, likes, and gifts drive both sides to send units into battle',
                        onClick: () => {
                            console.log('[HomeScreen] Live Interaction clicked');
                            window.location.hash = '/liveinteraction';
                        }
                    },
                    {
                        label: 'Replays',
                        tooltip: 'View and play back game replays',
                        onClick: () => {
                            console.log('[HomeScreen] Replays clicked');
                            if (this.controller) {
                                this.controller.pushScreen(MainMenuScreenType.ReplaySelection);
                            }
                        }
                    },
                ]
                : []),
            {
                label: 'LAN Multiplayer',
                tooltip: 'Exchange SDP manually to establish a LAN P2P data channel',
                onClick: () => {
                    console.log('[HomeScreen] LAN Setup clicked');
                    if (this.controller) {
                        this.controller.pushScreen(MainMenuScreenType.LanSetup);
                    }
                }
            },
        ];
        if (this.storageEnabled && !nativeShell) {
            buttons.push({
                label: this.strings.get('GUI:Mods') || 'Mods',
                tooltip: this.strings.get('STT:Mods') || 'Manage and play modified versions of the base game',
                onClick: async () => {
                    console.log('[HomeScreen] Mods clicked');
                    await this.messageBoxApi.alert('Mods - Under Development\n\nA mod management system is required', this.strings.get('GUI:OK') || 'OK');
                }
            });
        }
        if (!nativeShell) {
            buttons.push({
                label: this.strings.get('TS:InfoAndCredits') || 'Info & Credits',
                tooltip: this.strings.get('STT:InfoAndCredits') || 'Information and credits',
                onClick: () => {
                    console.log('[HomeScreen] Info & Credits clicked');
                    if (this.controller) {
                        this.controller.pushScreen(MainMenuScreenType.InfoAndCredits);
                    }
                }
            });
        }
        buttons.push({
            label: this.strings.get('GUI:Options') || 'Options',
            tooltip: this.strings.get('STT:MainButtonOptions') || 'Game options and settings',
            onClick: () => {
                console.log('[HomeScreen] Options clicked');
                if (this.controller) {
                    this.controller.pushScreen(MainMenuScreenType.Options);
                }
            }
        });
        if (!nativeShell) {
            buttons.push({
                label: 'Test Tools',
                tooltip: 'Access low-level file system and testing tools',
                onClick: () => {
                    console.log('[HomeScreen] Test Entry clicked');
                    if (this.controller) {
                        this.controller.pushScreen(MainMenuScreenType.TestEntry);
                    }
                }
            }, {
                label: this.strings.get('GUI:Fullscreen', getHumanReadableKey(FullScreen.hotKey)) || 'Fullscreen',
                tooltip: this.strings.get('STT:Fullscreen') || 'Toggle full screen mode',
                isBottom: true,
                disabled: this.fullScreen ? !this.fullScreen.isAvailable() : false,
                onClick: () => {
                    console.log('[HomeScreen] Fullscreen clicked');
                    this.toggleFullscreen();
                }
            });
        }
        if (this.controller) {
            this.controller.setSidebarButtons(buttons);
            this.controller.showSidebarButtons();
            this.controller.toggleMainVideo(true);
            this.controller.showVersion(this.appVersion);
        }
    }
    async onLeave(): Promise<void> {
        console.log('[HomeScreen] Leaving home screen');
        if (this.controller) {
            this.controller.hideVersion();
            await this.controller.hideSidebarButtons();
        }
    }
    async onStack(): Promise<void> {
        await this.onLeave();
    }
    onUnstack(): void {
        this.onEnter();
    }
    update(deltaTime: number): void {
    }
    destroy(): void {
    }
    private openCampaignMenu(): void {
        const overlay = document.createElement('div');
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:99999',
            'display:flex', 'align-items:center', 'justify-content:center',
            'background:rgba(0,0,0,0.65)',
            'font-family:"Microsoft YaHei",sans-serif',
        ].join(';');
        const panel = document.createElement('div');
        panel.style.cssText = [
            'width:380px', 'max-width:90vw', 'max-height:82vh', 'overflow-y:auto',
            'padding:22px 24px',
            'background:linear-gradient(180deg,#2a0b0b,#120303)',
            'border:2px solid #a67c00', 'box-shadow:0 0 30px #000',
            'color:#f5d76e',
        ].join(';');
        const title = document.createElement('div');
        title.textContent = '战役（Debug）';
        title.style.cssText = 'font-size:22px;font-weight:bold;text-align:center;margin-bottom:14px;color:#ffd966;';
        panel.appendChild(title);
        const missions = CAMPAIGN_MISSIONS;
        for (const mission of missions) {
            const button = document.createElement('button');
            button.textContent = mission.label + (isCampaignMissionCompleted(mission.map) ? ' ✓' : '');
            button.style.cssText = [
                'display:block', 'width:100%', 'margin:8px 0', 'padding:10px',
                'background:#3a0d0d', 'color:#ffd966', 'border:1px solid #a67c00',
                'font-size:16px', 'cursor:pointer', 'font-family:inherit',
            ].join(';');
            button.onclick = () => {
                const started = startCampaignMission(
                    this.rootController,
                    this.mapList,
                    this.gameModes,
                    mission.map,
                    this.strings,
                );
                if (started) {
                    overlay.remove();
                }
                else {
                    void this.messageBoxApi.alert(`${mission.map} 地图未安装。`, this.strings.get('GUI:OK') || 'OK');
                }
            };
            panel.appendChild(button);
        }
        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        cancel.style.cssText = [
            'display:block', 'width:100%', 'margin-top:14px', 'padding:8px',
            'background:#1a1a1a', 'color:#cccccc', 'border:1px solid #555',
            'font-size:14px', 'cursor:pointer', 'font-family:inherit',
        ].join(';');
        cancel.onclick = () => overlay.remove();
        panel.appendChild(cancel);
        overlay.appendChild(panel);
        overlay.onclick = (event) => {
            if (event.target === overlay) {
                overlay.remove();
            }
        };
        document.body.appendChild(overlay);
    }
    private async toggleFullscreen(): Promise<void> {
        try {
            if (this.fullScreen?.isAvailable()) {
                await this.fullScreen.toggleAsync();
            }
            else if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
            else {
                await document.documentElement.requestFullscreen();
            }
        }
        catch (err) {
            console.error('Error toggling fullscreen:', err);
            await this.messageBoxApi.alert(document.fullscreenElement
                ? 'Unable to exit full screen mode'
                : 'Unable to enter full screen mode\n\nPlease check your browser permission settings', this.strings.get('GUI:OK') || 'OK');
        }
    }
}
