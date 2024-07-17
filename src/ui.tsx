import React, { createRef, useState, useEffect, ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import saveUtils, { Save } from './save';

declare global {
    interface Window {
        loadData: (data: Save) => void;
    }
}

let appRoot = document.createElement("div");
document.body.appendChild(appRoot);
const root = createRoot(appRoot);


function App() {
    let loadFileSelectorRef = createRef<HTMLInputElement>();
    let loadMessageRef = createRef<HTMLSpanElement>();

    function loadWrapper() {
        if (loadFileSelectorRef.current) {
            if (loadMessageRef.current)
                saveUtils.loadSaveFile(loadFileSelectorRef.current, loadMessageRef.current);
            else
                saveUtils.loadSaveFile(loadFileSelectorRef.current);
            console.log(window.save);
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
            <input tabIndex={0} type="file" ref={loadFileSelectorRef} />
            <button tabIndex={0} onClick={loadWrapper}>load</button>
            <button tabIndex={0} onClick={saveWrapper}>save</button><br />
            <span ref={loadMessageRef}>&nbsp;</span>
        </div>
    }

    function EditorUI() {
        const [saveData, setSaveData] = useState<Save>({
            fileName: "Empty",
            version: 2,
            name: "",
            exp: 0,
            items: [],
            players: [
                {
                    weapon: 0,
                    armor: 0
                },
                {
                    weapon: 0,
                    armor: 0
                },
                {
                    weapon: 0,
                    armor: 0
                }
            ],
            susieActive: true,
            noelleActive: false,
            playTime: 0,
            zone: 0,
            gold: 0,
            deaths: 0,
            flags: {
                flags: [],
                types: []
            },
            persistentFlags: {
                flags: [],
                types: []
            }
        });

        useEffect(() => {
            // Automatically load data when the component mounts
            loadData(window.save);
        }, []);

        useEffect(() => {
            window.save = saveData;
        }, [saveData]);

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const { id, value } = e.target;
            setSaveData((prevData) => ({
                ...prevData,
                [id]: id === 'version' || id === 'exp' || id === 'playTime' || id === 'zone' || id === 'gold' || id === 'deaths'
                    ? Number(value)
                    : value
            }));
        };

        let loadData = (data: Save) => {
            setSaveData(data);
        };

        window.loadData = loadData

        return (
            <div className='editorMain'>
                <h1 className='editorFileName'>{saveData.fileName}</h1>
                <details>
                    <summary>Main Stats</summary>
                    <table>
                        <tr>
                            <td><label htmlFor='version'>Version: </label></td>
                            <td><input tabIndex={0} id='version' type='number' min={0} max={2} value={saveData.version} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='name'>Name: </label></td>
                            <td><input tabIndex={0} id='name' type='text' maxLength={255} value={saveData.name} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='exp'>EXP: </label></td>
                            <td><input tabIndex={0} id='exp' type='number' min={0} max={4294967295} value={saveData.exp} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='playTime'>Play time: </label></td>
                            <td><input tabIndex={0} id='playTime' type='number' min={0} max={4294967295} value={saveData.playTime} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='zone'>Zone: </label></td>
                            <td><input tabIndex={0} id='zone' type='number' min={0} max={65535} value={saveData.zone} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='gold'>Gold: </label></td>
                            <td><input tabIndex={0} id='gold' type='number' min={0} max={4294967295} value={saveData.gold} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <td><label htmlFor='deaths'>Deaths: </label></td>
                            <td><input tabIndex={0} id='deaths' type='number' min={0} max={4294967295} value={saveData.deaths} onChange={handleChange} /></td>
                        </tr>
                    </table>
                </details>
            </div>
        );
    }

    return <>
        <FileUI/>
        <EditorUI/>
    </>
}
root.render(<App />);