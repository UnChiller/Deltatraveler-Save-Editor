function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (loader => {
        let saveData = new Uint8Array(loader.target.result);
        loadMessage.innerText = "Loading...";
        if (processSaveFile(saveData)) {
            loadMessage.innerText = "Successfully loaded save";
            setTimeout(() => {loadMessage.innerText = ""});
        } else {
            loadMessage.innerText = "failed to load save";
        }
    });
    saveFileReader.readAsArrayBuffer(saveFile.files[0]);
}

function processSaveFile(saveData) {
    console.log(saveData);
    return true;
}

submitFile.onclick = loadSaveFile;
