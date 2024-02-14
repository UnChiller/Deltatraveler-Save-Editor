let saveData;
function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.readAsArrayBuffer(saveFile.files[0]);
    saveData = new Uint8Array(saveFileReader.result);
}
submitFile.onclick = loadSaveFile;
