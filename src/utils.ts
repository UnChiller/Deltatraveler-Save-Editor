export function download(data: ArrayBuffer, filename: string) {
    let file = new Blob([data]);
    let a: HTMLAnchorElement = document.createElement("a");
    let url: string = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);  
    }, 0);
}

export function downloadJSON(data: any, filename: string): void {
    let file = new Blob([JSON.stringify(data,null,4)],{
        type: "application/json",
    });
    let a: HTMLAnchorElement = document.createElement("a");
    let url: string = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);  
    }, 0);
}

export function loadBinFile(saveFile: File, handler: (progev: ProgressEvent<FileReader>) => void): void {
    let saveFileReader = new FileReader();
    saveFileReader.onload = handler;
    saveFileReader.readAsArrayBuffer(saveFile);
}

export function loadTextFile(saveFile: File, handler: (progev: ProgressEvent<FileReader>) => void): void {
    let saveFileReader = new FileReader();
    saveFileReader.onload = handler;
    saveFileReader.readAsText(saveFile);
}

export function loadFile(saveFile: File, handler: (progev: ProgressEvent<FileReader>) => void): void {
    if (saveFile.type.split("/",2)[0] === "text" || saveFile.type === "application/json")
        loadTextFile(saveFile, handler);
    else
        loadBinFile(saveFile, handler);
}