declare let loadMessage: HTMLElement | null;
declare let saveFile: HTMLInputElement | null | any;
interface Save {
    version: number;
    name: string;
    exp: number;
    items: number[];
    players: Player[];
    susieActive: boolean;
    noelleActive: boolean;
    playTime: number;
    zone: number;
    gold: number;
    deaths: number;
    flags: Flag[];
    persistentFlags: Flag[];
}
declare function loadSaveFile(): void;
declare type Player = {
    weapon: number;
    armor: number;
};
declare type Flag = null | number | string | boolean;
declare function processSaveFile(saveData: Uint8Array): Save;
