import React from 'react'
import { createRoot } from 'react-dom/client';
import saveUtils from './save'
let appRoot = document.createElement("div");
document.body.appendChild(appRoot)
const root = createRoot(appRoot)
//saveUtils.loadSaveFile()
/*let thing = <>
    <input type="file" id="saveFile"/>
    <button onClick={saveUtils.loadSaveFile}>load</button><br/>
    <span/>
</>*/