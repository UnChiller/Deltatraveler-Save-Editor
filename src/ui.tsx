import React, { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import saveUtils from './save';

let appRoot = document.createElement("div");
document.body.appendChild(appRoot);
const root = createRoot(appRoot);

let loadFileSelectorRef = createRef<HTMLInputElement>();
let loadButtonRef = createRef<HTMLButtonElement>();
let saveButtonRef = createRef<HTMLButtonElement>();
let loadMessageRef = createRef<HTMLSpanElement>();

function loadWrapper() {
    if (loadFileSelectorRef.current)
        if (loadMessageRef.current)
            saveUtils.loadSaveFile(loadFileSelectorRef.current, loadMessageRef.current);
        else
            saveUtils.loadSaveFile(loadFileSelectorRef.current);
    else
        console.error("loadFileSelector missing");
}
function saveWrapper() {
    if (loadMessageRef.current)
        saveUtils.downloadSaveFile(loadMessageRef.current);
    else
        saveUtils.downloadSaveFile();
}

let loadFileSelector = <input type="file" ref={loadFileSelectorRef}/>;
let loadButtonEle = <button onClick={loadWrapper} ref={loadButtonRef}>load</button>;
let saveButtonEle = <button onClick={saveWrapper} ref={saveButtonRef}>save</button>;
let loadMessageEle = <span ref={loadMessageRef}/>;

let loadSaveFileDia = <>
    {loadFileSelector}
    {loadButtonEle}
    {saveButtonEle}<br/>
    {loadMessageEle}
</>;

root.render(loadSaveFileDia)