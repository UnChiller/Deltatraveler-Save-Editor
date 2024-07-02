import React, { createRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import saveUtils from './save';

let appRoot = document.createElement("div");
document.body.appendChild(appRoot);
const root = createRoot(appRoot);

function App() {
    const [fileLoaded, setFileLoaded] = useState(false);
    let loadFileSelectorRef = createRef<HTMLInputElement>();
    let loadMessageRef = createRef<HTMLSpanElement>();

    function loadWrapper() {
        if (loadFileSelectorRef.current) {
            if (loadMessageRef.current)
                saveUtils.loadSaveFile(loadFileSelectorRef.current, loadMessageRef.current);
            else
                saveUtils.loadSaveFile(loadFileSelectorRef.current);
            setFileLoaded(true);
        } else
            console.error("loadFileSelector missing");
    }
    function saveWrapper() {
        if (loadMessageRef.current)
            saveUtils.downloadSaveFile(loadMessageRef.current);
        else
            saveUtils.downloadSaveFile();
    }

    function FileUI() {
        return <div>
            <input type="file" ref={loadFileSelectorRef}/>
            <button onClick={loadWrapper}>load</button>
            <button onClick={saveWrapper}>save</button><br/>
            <span ref={loadMessageRef}/>
        </div>
    }

    let editorUI = <>
        <span>Pretend there's an editor here</span>
    </>

    return <>
        <FileUI/>
        {fileLoaded && editorUI}
    </>
}
root.render(<App/>);