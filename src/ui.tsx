import React, { createRef } from 'react'
import { createRoot } from 'react-dom/client';
import saveUtils from './save'

let appRoot = document.createElement("div");
document.body.appendChild(appRoot)
const root = createRoot(appRoot)

let loadFileSelectorRef = createRef<HTMLInputElement>()
let loadButtonRef = createRef<HTMLButtonElement>()
let loadMessageRef = createRef<HTMLSpanElement>()

function loadWrapper() {
    if (loadFileSelectorRef.current)
        saveUtils.loadSaveFile(loadFileSelectorRef.current)
}
let loadFileSelector = <input type="file" id="saveFile" ref={loadFileSelectorRef}/>
let loadButtonEle = <button onClick={loadWrapper} ref={loadButtonRef}>load</button>
let loadMessageEle = <span ref={loadMessageRef}/>

let loadSaveFileDia = <>
    {loadFileSelector}
    {loadButtonEle}<br/>
    {loadMessageEle}
</>

root.render(loadSaveFileDia)