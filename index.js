let saveData;
function loadSaveFile() {
    let saveFileReader = new FileReader();
    saveFileReader.onload = (thing => console.log(thing));
    saveFileReader.readAsArrayBuffer(saveFile.files[0]);
    saveData = new Uint8Array(saveFileReader.result);
    console.log(saveFileReader);
}
submitFile.onclick = loadSaveFile;
