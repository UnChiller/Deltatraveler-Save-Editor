declare let loadMessage: HTMLElement | null;
declare let saveFile: HTMLInputElement | null | any;
declare type FlagTup = {
    flags: Flag[];
    types: number[];
};
interface Save {
    fileName: string;
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
    flags: FlagTup;
    persistentFlags: FlagTup;
}
declare function displayLoadMessage(text: string, clear?: boolean): void;
declare function loadSaveFile(): void;
declare type Player = {
    weapon: number;
    armor: number;
};
declare type Flag = null | number | string | boolean;
declare function processSaveFile(saveData: Uint8Array, name: string): Save;
declare function download(data: ArrayBuffer, filename: string): void;
declare function appendData(data: ArrayBuffer, moreData: ArrayBuffer): ArrayBuffer;
declare function downloadSaveFile(saveJSON: Save): void;
