"use strict";
let loadMessage = document.getElementById("loadMessage");
let saveFile = document.getElementById("saveFile");
function displayLoadMessage(text, clear) {
    if (loadMessage === null) {
        console.error("Couldn't find loadMessage");
        console.info(text);
        return;
    }
    loadMessage.innerText = text;
    if (clear) {
        setTimeout(() => {
            if (loadMessage === null) {
                console.error("Couldn't find loadMessage");
                return;
            }
            loadMessage.innerText = "";
        }, 5000);
    }
}
function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (loader => {
        if (loader.target === null) {
            console.error("null FileReader");
            return;
        }
        else if (loader.target.result === null || typeof loader.target.result === "string") {
            console.error("File load result not ArrayBuffer");
            return;
        }
        let saveData = new Uint8Array(loader.target.result);
        displayLoadMessage("Loading...", false);
        let saveJSON;
        try {
            if (!saveFile || saveFile.files === null) {
                displayLoadMessage("Please select a file");
                return;
            }
            saveJSON = processSaveFile(saveData, saveFile.files[0].name);
            displayLoadMessage("Successfully loaded save");
        }
        catch (error) {
            console.error(error);
            displayLoadMessage(error.message);
        }
    });
    if (!saveFile || saveFile.files === null) {
        displayLoadMessage("Please select a file");
        return;
    }
    saveFileReader.readAsArrayBuffer(saveFile.files[0]);
}
function processSaveFile(saveData, name) {
    let counter = 0;
    function readByte() {
        let byte = saveData[counter];
        counter++;
        return byte;
    }
    function readBoolean() {
        return !!readByte();
    }
    function readInt16() {
        let bytes = [readByte(), readByte()];
        return bytes[0] + (bytes[1] << 8);
    }
    function readInt32() {
        let ints = [readInt16(), readInt16()];
        return ints[0] + (ints[1] << 16);
    }
    function byteArrayToString(byteArray) {
        let string = "";
        for (let i = 0; i < byteArray.length; i++) {
            string += String.fromCharCode(byteArray[i]);
        }
        return string;
    }
    function readString() {
        let strLength = readByte();
        let byteArray = saveData.slice(counter, counter + strLength);
        counter += strLength;
        return byteArrayToString(byteArray);
    }
    function readSingle() {
        let bytes = saveData.slice(counter, counter + 4);
        counter += 4;
        return new Float32Array(bytes.buffer)[0];
    }
    function readItems() {
        let itemCount = readByte();
        let items = Array(itemCount);
        for (let i = 0; i < itemCount; i++) {
            items[i] = readInt16();
        }
        return items;
    }
    function readPlayer() {
        let player = {
            weapon: 0,
            armor: 0
        };
        player.weapon = readInt16();
        player.armor = readInt16();
        return player;
    }
    function readFlags() {
        let flagCount = readInt16();
        let flags = Array(flagCount);
        let types = Array(flagCount);
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
        };
    }
    if (byteArrayToString(saveData.slice(0, 4)) !== "SAVE") {
        throw new Error('not v3 save');
    }
    counter += 4;
    let saveJSON = {};
    saveJSON.fileName = name;
    saveJSON.version = readInt16();
    if (saveJSON.version > 0) {
        throw new Error('Unsupported version');
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
function download(data, filename) {
    let file = new Blob([data]);
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}
function appendData(data, moreData) {
    let newData = new ArrayBuffer(data.byteLength + moreData.byteLength);
    let view = new Uint8Array(newData);
    view.set(new Uint8Array(data));
    view.set(new Uint8Array(moreData), data.byteLength);
    return view.buffer;
}
function downloadSaveFile(saveJSON) {
    let myData = new ArrayBuffer(0);
    function writeByte(byte) {
        myData = appendData(myData, (new Uint8Array([byte])).buffer);
    }
    function writeBoolean(bool) {
        writeByte(+bool);
    }
    function writeInt16(int) {
        myData = appendData(myData, (new Uint16Array([int])).buffer);
    }
    function writeInt32(int) {
        myData = appendData(myData, (new Uint32Array([int])).buffer);
    }
    function writeString(string) {
        writeByte(string.length);
        for (let i = 0; i < string.length; i++) {
            writeByte(string.charCodeAt(i));
        }
    }
    function writeSingle(num) {
        myData = appendData(myData, (new Float32Array([num])).buffer);
    }
    function writeItems(items) {
        writeByte(items.length);
        for (let i = 0; i < items.length; i++) {
            writeInt16(items[i]);
        }
    }
    function writePlayer(player) {
        writeInt16(player.weapon);
        writeInt16(player.armor);
    }
    function writeFlags(flags) {
        writeInt16(flags.flags.length);
        for (let i = 0; i < flags.flags.length; i++) {
            writeByte(flags.types[i]);
            if (flags.types[i] === 0) {
                let test = flags.flags[i];
                if (typeof test === "number")
                    writeInt32(test);
                else
                    throw new TypeError("Stop tampering pls");
            }
            else if (flags.types[i] === 1) {
                let test = flags.flags[i];
                if (typeof test === "string")
                    writeString(test);
                else
                    throw new TypeError("Stop tampering pls");
            }
            else if (flags.types[i] === 2) {
                let test = flags.flags[i];
                if (typeof test === "boolean")
                    writeBoolean(test);
                else
                    throw new TypeError("Stop tampering pls");
            }
            else if (flags.types[i] === 3) {
                let test = flags.flags[i];
                if (typeof test === "number")
                    writeSingle(test);
                else
                    throw new TypeError("Stop tampering pls");
            }
        }
    }
    writeByte(83);
    writeByte(65);
    writeByte(86);
    writeByte(69);
    writeInt16(saveJSON.version);
    writeString(saveJSON.name);
    writeInt32(saveJSON.exp);
    writeItems(saveJSON.items);
    writePlayer(saveJSON.players[0]);
    writePlayer(saveJSON.players[1]);
    writePlayer(saveJSON.players[2]);
    writeBoolean(saveJSON.susieActive);
    writeBoolean(saveJSON.noelleActive);
    writeInt32(saveJSON.playTime);
    writeInt16(saveJSON.zone);
    writeInt32(saveJSON.gold);
    writeInt32(saveJSON.deaths);
    writeFlags(saveJSON.flags);
    writeFlags(saveJSON.persistentFlags);
    download(myData, saveJSON.fileName);
}
