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
        for (let i = 0; i < flagCount; i++) {
            let byte = readByte();
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
        return flags;
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
