function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (loader => {
        let saveData = new Uint8Array(loader.target.result);
        loadMessage.innerText = "Loading...";
        let message = processSaveFile(saveData);
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
    console.log(saveData);
    return "Successfully loaded save";
}

submitFile.onclick = loadSaveFile;
