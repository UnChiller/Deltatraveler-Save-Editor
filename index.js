function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (loader => {
        let saveData = new Uint8Array(loader.target.result);
        loadMessage.innerText = "Successfully loaded save";
        setTimeout(() => {loadMessage.innerText = ""});
        processSaveFile(saveData);
    });
    saveFileReader.readAsArrayBuffer(saveFile.files[0]);
}

function processSaveFile(saveData) {
    console.log(saveData);
}

submitFile.onclick = loadSaveFile;
