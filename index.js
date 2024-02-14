function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (loader => {
        let saveData = new Uint8Array(loader.target.result);
        loadMessage.innerText = "Loading...";
        let saveJSON;
        try {
            saveJSON = processSaveFile(saveData);
            loadMessage.innerText = "Successfully loaded save";
            setTimeout(() => {loadMessage.innerText = ""}, 5000);
        } catch(e) {
            console.error(e);
            loadMessage.innerText = e.message;
            setTimeout(() => {loadMessage.innerText = ""}, 5000);
        }
    });
    saveFileReader.readAsArrayBuffer(saveFile.files[0]);
}

function processSaveFile(saveData) {
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
        let byteArray = saveData.slice(counter,counter+strLength);
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
        let player = {};
        player.weapon = readInt16();
        player.armor = readInt16();
        return player;
    }
    
    function readFlags() {
        let flagCount = readInt16();
        let flags = Array(flagCount);
        for (let i = 0; i < flagCount; i++) {
            let byte = readByte()
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
                    console.log("byte: " + byte)
                    console.log(flags)
                    throw new Error('Corrupted save');
            }
        }
        return flags
    }

    if (byteArrayToString(saveData.slice(0,4)) === "SAVE") {
        throw new Error('not v3 save');
    }
    counter += 4;
    let saveJSON = {};
    saveJSON.version = readInt16();
    if (version > 0) {
        throw new Error('Unsupported version');
    }
    saveJSON.name = readString();
    saveJSON.exp = readInt32();
    saveJSON.items = readItems();
    saveJSON.player1 = readPlayer();
    saveJSON.player2 = readPlayer();
    saveJSON.player3 = readPlayer();
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

submitFile.onclick = loadSaveFile;
