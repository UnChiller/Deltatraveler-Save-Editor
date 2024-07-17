import { download, loadBinFile, loadFile } from './utils';
declare global {
    interface Window {
        save: Save;
    }
}
window.save = {
    fileName: "Empty",
    version: 2,
    name: "",
    exp: 0,
    items: [],
    players: [
        {
            weapon: 0,
            armor: 0
        },
        {
            weapon: 0,
            armor: 0
        },
        {
            weapon: 0,
            armor: 0
        }
    ],
    susieActive: true,
    noelleActive: false,
    playTime: 0,
    zone: 0,
    gold: 0,
    deaths: 0,
    flags: {
        flags: [],
        types: []
    },
    persistentFlags: {
        flags: [],
        types: []
    }
};
const salt = new Uint8Array([83,84,79,80,46,32,80,79,83,84,73,78,71,46,32,65,66,79,85,84,46,32,65,77,79,78,71,46,32,85,83,46]);

async function computeSha256(input: ArrayBuffer): Promise<ArrayBuffer> {
    return await crypto.subtle.digest("SHA-256", input);
}

type FlagTup = {
    flags: Flag[];
    types: number[];
}

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

function displayLoadMessage(text: string, loadMessage?: HTMLSpanElement | null, keep?: boolean): void {
    if (!loadMessage) {
        console.warn("loadMessage not provided");
        console.info(text);
        return;
    }
    loadMessage.innerText = text;
    if (!keep) {
        setTimeout(() => {
            if (loadMessage === null) {
                console.error("Couldn't find loadMessage");
                return;
            }
            loadMessage.innerHTML = "&nbsp;";
        }, 5000);
    }
}

export function loadSaveFile(saveFile: HTMLInputElement, loadMessage?: HTMLSpanElement): void {
    if (!saveFile || saveFile.files === null || !saveFile.files[0]) {
        displayLoadMessage("Please select a file", loadMessage);
        return;
    }
    loadBinFile(saveFile.files[0], async progev => {
        if (progev.target === null) {
            console.error("null FileReader");
            return;
        } else if (progev.target.result === null || typeof progev.target.result === "string") {
            console.error("File load result not ArrayBuffer");
            return;
        }
        let saveData = new Uint8Array(progev.target.result);
        displayLoadMessage("Loading...", loadMessage, true);
        try {
            if (!saveFile || saveFile.files === null || !saveFile.files[0] ) {
                displayLoadMessage("Please select a file", loadMessage);
                return;
            }
            window.save = await processSaveFile(saveData, saveFile.files[0].name);
            window.loadData(window.save);
            displayLoadMessage("Successfully loaded save", loadMessage);
        } catch(error: any) {
            console.error(error);
            displayLoadMessage(error.message, loadMessage);
        }
    })
}

type Player = {
    weapon: number;
    armor: number;
}

type Flag = null | number | string | boolean;

async function processSaveFile(saveData: Uint8Array, name: string): Promise<Save> {
    let counter = 0;
    
    function readByte(): number {
        let byte = saveData[counter];
        counter++;
        return byte;
    }
    
    function readBoolean(): boolean {
        return !!readByte();
    }
    
    function readInt16(): number {
        let bytes = [readByte(), readByte()];
        return bytes[0] + (bytes[1] << 8);
    }
    
    function readInt32(): number {
        let ints = [readInt16(), readInt16()];
        return ints[0] + (ints[1] << 16);
    }
    
    function byteArrayToString(byteArray: Uint8Array): string {
        let string = "";
        for (let i = 0; i < byteArray.length; i++) {
            string += String.fromCharCode(byteArray[i]);
        }
        return string;
    }
    
    function readString(): string {
        let strLength = readByte();
        let byteArray = saveData.slice(counter,counter+strLength);
        counter += strLength;
        return byteArrayToString(byteArray);
    }
    
    function readSingle(): number {
        let bytes = saveData.slice(counter, counter + 4);
        counter += 4;
        return new Float32Array(bytes.buffer)[0];
    }

    function readItems(): number[] {
        let itemCount: number = readByte();
        let items: number[] = Array(itemCount);
        for (let i = 0; i < itemCount; i++) {
            items[i] = readInt16();
        }
        return items;
    }

    function readPlayer(): Player {
        let player: Player = {
            weapon: 0,
            armor: 0
        };
        player.weapon = readInt16();
        player.armor = readInt16();
        return player;
    }

    function readFlags(): {flags: Flag[], types: number[]} {
        let flagCount = readInt16();
        let flags: Flag[] = Array(flagCount);
        let types: number[] = Array(flagCount);
        for (let i = 0; i < flagCount; i++) {
            let byte = readByte();
            types[i] = byte;
            switch (byte) {
                case (255):
                    flags[i] = null;
                    break;
                case (0):
                    flags[i] = readInt32();
                    break;
                case (1):
                    flags[i] = readString();
                    break;
                case (2):
                    flags[i] = readBoolean();
                    break;
                case (3):
                    flags[i] = readSingle();
                    break;
                default:
                    throw new Error('Corrupted save');
            }
        }
        return { 
            flags: flags,
            types: types
        }
    }
    
    if (byteArrayToString(saveData.slice(0, 4)) !== "SAVE") {
        throw new Error('not v3 save');
    }
    counter += 4;
    let saveJSON: any = {};
    saveJSON.fileName = name;
    saveJSON.version = readInt16();
    if (saveJSON.version > 2) {
        throw new Error('Unsupported version '+saveJSON.version);
    }
    if (saveJSON.version > 0) {
        // read sha256 hash
        let hash = saveData.slice(counter, counter + 32);
        // copy salt in place of hash
        for (let i = 0; i < 32; i++) {
            saveData[counter+i] = salt[i];
        }
        counter += 32;
        let newHash = await computeSha256(saveData.buffer)
        let newHashArray = new Uint8Array(newHash);
        for (let i = 0; i < 32; i++) {
            if (hash[i] !== newHashArray[i]) {
                throw new Error('Hash mismatch');
            }
        }
    }
    saveJSON.name = readString();
    saveJSON.exp = readInt32();
    saveJSON.items = readItems();
    saveJSON.players = [
        readPlayer(),
        readPlayer(),
        readPlayer()
    ];
    saveJSON.susieActive = readBoolean();
    saveJSON.noelleActive = readBoolean();
    saveJSON.playTime = readInt32();
    saveJSON.zone = readInt16();
    saveJSON.gold = readInt32();
    saveJSON.deaths = readInt32();
    saveJSON.flags = readFlags();
    saveJSON.persistentFlags = readFlags();
    
    console.log(saveJSON);
    return saveJSON;
}

function appendData(data: ArrayBuffer, moreData: ArrayBuffer): ArrayBuffer {
    let newData = new ArrayBuffer(data.byteLength+moreData.byteLength);
    let view = new Uint8Array(newData);
	view.set(new Uint8Array(data));
    view.set(new Uint8Array(moreData),data.byteLength);
    return view.buffer;
}

export function downloadSaveFile(loadMessage?: HTMLSpanElement): void {
    if (!window.save) {
        displayLoadMessage("Please load a file first",loadMessage)
        return
    }
    let myData = new ArrayBuffer(0);

    function writeByte(byte: number): void {
        myData=appendData(myData, (new Uint8Array([byte])).buffer);
    }
    
    function writeBoolean(bool: boolean): void {
        writeByte(+bool);
    }
    
    function writeInt16(int: number): void {
        myData=appendData(myData, (new Uint16Array([int])).buffer);
    }
    
    function writeInt32(int: number): void {
        myData=appendData(myData, (new Uint32Array([int])).buffer);
    }
    
    function writeString(string: string): void {
        writeByte(string.length);
        for (let i = 0; i < string.length; i++) {
            writeByte(string.charCodeAt(i));
        }
    }
    
    function writeSingle(num: number): void {
        myData=appendData(myData,(new Float32Array([num])).buffer);
    }

    function writeItems(items: number[]): void {
        writeByte(items.length);
        for (let i = 0; i < items.length; i++) {
            writeInt16(items[i]);
        }
    }

    function writePlayer(player: Player): void {
        writeInt16(player.weapon);
        writeInt16(player.armor);
    }

    function writeFlags(flags: FlagTup): void {
        writeInt16(flags.flags.length);
        for (let i = 0; i < flags.flags.length; i++) {
            writeByte(flags.types[i])
            if (flags.types[i] === 0) {
                let test = flags.flags[i]
                if (typeof test === "number")
                    writeInt32(test)
                else
                    throw new TypeError("Data type mismatch")
            } else if (flags.types[i] === 1) {
                let test = flags.flags[i]
                if (typeof test === "string")
                    writeString(test)
                else
                    throw new TypeError("Data type mismatch")
            } else if (flags.types[i] === 2) {
                let test = flags.flags[i]
                if (typeof test === "boolean")
                    writeBoolean(test)
                else
                    throw new TypeError("Data type mismatch")
            } else if (flags.types[i] === 3) {
                let test = flags.flags[i]
                if (typeof test === "number")
                    writeSingle(test)
                else
                    throw new TypeError("Data type mismatch")
            }
        }
    }

    // Magic bytes
    writeByte(83);
    writeByte(65);
    writeByte(86);
    writeByte(69);

    writeInt16(window.save.version);
    if (window.save.version > 0) {
        myData=appendData(myData, salt);
    }
    writeString(window.save.name);
    writeInt32(window.save.exp);
    writeItems(window.save.items);
    writePlayer(window.save.players[0])
    writePlayer(window.save.players[1])
    writePlayer(window.save.players[2])
    writeBoolean(window.save.susieActive);
    writeBoolean(window.save.noelleActive);
    writeInt32(window.save.playTime);
    writeInt16(window.save.zone);
    writeInt32(window.save.gold);
    writeInt32(window.save.deaths);
    writeFlags(window.save.flags);
    writeFlags(window.save.persistentFlags);

    computeSha256(myData).then(hash => {
        if (!window.save) {
            displayLoadMessage("Save missing in hashing handler. Race condition?",loadMessage)
            return
        }
        // replace salt with hash
        let hashArray = new Uint8Array(hash);
        let myDataArray = new Uint8Array(myData);
        for (let i = 0; i < 32; i++) {
            myDataArray[i+6] = hashArray[i];
        }
        download(myData, window.save.fileName)
    });
    
}

export default {loadSaveFile, downloadSaveFile}
export {Save,Player,Flag,FlagTup}