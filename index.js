function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (loader => {
        let saveData = new Uint8Array(loader.target.result);
        loadMessage.innerText = "Loading...";
        let message = processSaveFile(saveData);
        console.log(message);
        if (message) {
            loadMessage.innerText = message;
            setTimeout(() => {loadMessage.innerText = ""}, 5000);
        } else {
            loadMessage.innerText = "failed to load save";
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
    
    console.log(saveData);
    return "Successfully loaded save";
}

submitFile.onclick = loadSaveFile;
