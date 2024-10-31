import React, { createRef, useState, useEffect, ChangeEvent, StrictMode } from 'react';
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
        return <div className='file-ui'>
            <div>
                <input type="file" ref={loadFileSelectorRef} />
                <button onClick={loadWrapper}><img src="icons/upload.svg" alt="upload icon" /><span>Load</span></button>
                <button onClick={saveWrapper}><img src="icons/download.svg" alt="download icon" /><span>Save</span></button>
            </div>
            <span ref={loadMessageRef}>&nbsp;</span>
        </div>
    }

    function EditorUI() {
        //console.log('Component rendered');
        const [saveData, setSaveData] = useState<Save>(window.save);

        useEffect(() => {
            // Automatically load data when the component mounts
            loadData(window.save);
        }, []);

        useEffect(() => {
            window.save = saveData;
        }, [saveData]);

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const { id, value, checked } = e.target;
            if (id === 'version' || id === 'exp' || id === 'playTime' || id === 'zone' || id === 'gold' || id === 'deaths') {
                setSaveData((prevData) => ({
                    ...prevData,
                    [id]: Number(value)
                }));
            } else if (id === "name") {
                setSaveData((prevData) => ({
                    ...prevData,
                    [id]: value
                }));
            } else if (id === "susieActive" || id === "noelleActive") {
                setSaveData((prevData) => ({
                    ...prevData,
                    [id]: checked
                }));
            } else if (id === "player1weapon" || id === "player2weapon" || id === "player3weapon" || id === "player1armor" || id === "player2armor" || id === "player3armor") {
                switch (id) {
                    case "player1weapon":
                        setSaveData((prevData) => ({
                            ...prevData,
                            'players': [
                                {
                                    ...prevData.players[0],
                                    'weapon': Number(value)
                                },
                                prevData.players[1],
                                prevData.players[2]
                            ]
                        }));
                        break;
                    case "player2weapon":
                        setSaveData((prevData) => ({
                            ...prevData,
                            'players': [
                                prevData.players[0],
                                {
                                    ...prevData.players[1],
                                    'weapon': Number(value)
                                },
                                prevData.players[2]
                            ]
                        }));
                        break;
                    case "player3weapon":
                        setSaveData((prevData) => ({
                            ...prevData,
                            'players': [
                                prevData.players[0],
                                prevData.players[1],
                                {
                                    ...prevData.players[2],
                                    'weapon': Number(value)
                                }
                            ]
                        }));
                        break;
                    case "player1armor":
                        setSaveData((prevData) => ({
                            ...prevData,
                            'players': [
                                {
                                    ...prevData.players[0],
                                    'armor': Number(value)
                                },
                                prevData.players[1],
                                prevData.players[2]
                            ]
                        }));
                        break;
                    case "player2armor":
                        setSaveData((prevData) => ({
                            ...prevData,
                            'players': [
                                prevData.players[0],
                                {
                                    ...prevData.players[1],
                                    'armor': Number(value)
                                },
                                prevData.players[2]
                            ]
                        }));
                        break;
                    case "player3armor":
                        setSaveData((prevData) => ({
                            ...prevData,
                            'players': [
                                prevData.players[0],
                                prevData.players[1],
                                {
                                    ...prevData.players[2],
                                    'armor': Number(value)
                                }
                            ]
                        }));
                        break;
                }
            } else if (id.slice(0, 4) === "item") {
                const indices = ["item0", "item1", "item2", "item3", "item4", "item5", "item6", "item7"];
                let thisIndex = indices.indexOf(id);
                if (thisIndex === -1) return;
                setSaveData((prevData) => ({
                    ...prevData,
                    'items': [
                        ...(prevData.items.slice(0, thisIndex)),
                        Number(value),
                        ...(prevData.items.slice(thisIndex + 1))
                    ]
                }));
            }
        };

        let loadData = (data: Save) => {
            //console.log(data,saveData); // new data
            setSaveData(data);
            //setSaveData(prevSaveData => {
            //    console.log('inside setSaveData:', prevSaveData, ' -> ', data);
            //    return data;
            //})
        };

        window.loadData = loadData

        return (
            <div>
                <h2>{saveData.fileName}</h2>
                <details className='main-stats' open>
                    <summary>Main Stats</summary>
                    <table>
                        <tbody>
                            <tr>
                                <td><label htmlFor='version'>Version: </label></td>
                                <td><input id='version' type='number' min={0} max={2} value={saveData.version} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='name'>Name: </label></td>
                                <td><input id='name' type='text' maxLength={255} value={saveData.name} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='exp'>EXP: </label></td>
                                <td><input id='exp' type='number' min={0} max={4294967295} value={saveData.exp} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='playTime'>Play time: </label></td>
                                <td><input id='playTime' type='number' min={0} max={4294967295} value={saveData.playTime} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='zone'>Zone: </label></td>
                                <td><input id='zone' type='number' min={0} max={65535} value={saveData.zone} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='gold'>Gold: </label></td>
                                <td><input id='gold' type='number' min={0} max={4294967295} value={saveData.gold} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='deaths'>Deaths: </label></td>
                                <td><input id='deaths' type='number' min={0} max={4294967295} value={saveData.deaths} onChange={handleChange} /></td>
                            </tr>
                        </tbody>
                    </table>
                </details>
                <details className='player-stats' open>
                    <summary>Players</summary>
                    <table>
                        <tbody>
                            <tr>
                                <td aria-label='Player info'></td>
                                <td><label>Player</label></td>
                                <td><label htmlFor='susieActive'>Susie</label><input aria-label='Susie Enabled' id='susieActive' type='checkbox' checked={saveData.susieActive} onChange={handleChange} /></td>
                                <td><label htmlFor='noelleActive'>Noelle</label><input aria-label='Noelle Enabled' id='noelleActive' type='checkbox' checked={saveData.noelleActive} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label>Weapon</label></td>
                                <td><input aria-label='Player Weapon' id='player1weapon' type='number' min={0} max={65535} value={saveData.players[0].weapon} onChange={handleChange} /></td>
                                <td><input aria-label='Susie Weapon' id='player2weapon' type='number' min={0} max={65535} value={saveData.players[1].weapon} onChange={handleChange} /></td>
                                <td><input aria-label='Noelle Weapon' id='player3weapon' type='number' min={0} max={65535} value={saveData.players[2].weapon} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label>Armor</label></td>
                                <td><input aria-label='Player Armor' id='player1armor' type='number' min={0} max={65535} value={saveData.players[0].armor} onChange={handleChange} /></td>
                                <td><input aria-label='Susie Armor' id='player2armor' type='number' min={0} max={65535} value={saveData.players[1].armor} onChange={handleChange} /></td>
                                <td><input aria-label='Noelle Armor' id='player3armor' type='number' min={0} max={65535} value={saveData.players[2].armor} onChange={handleChange} /></td>
                            </tr>
                        </tbody>
                    </table>
                </details>
                <details className='items' open>
                    <summary>Items</summary>
                    <table>
                        <tbody>
                            <tr>
                                <td><label htmlFor='item0'>Item 1.</label><input id='item0' type='number' min={0} max={65535} value={saveData.items[0]} onChange={handleChange} /></td>
                                <td><label htmlFor='item1'>Item 2.</label><input id='item1' type='number' min={0} max={65535} value={saveData.items[1]} onChange={handleChange} /></td>
                                <td><label htmlFor='item2'>Item 3.</label><input id='item2' type='number' min={0} max={65535} value={saveData.items[2]} onChange={handleChange} /></td>
                                <td><label htmlFor='item3'>Item 4.</label><input id='item3' type='number' min={0} max={65535} value={saveData.items[3]} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td><label htmlFor='item4'>Item 5.</label><input id='item4' type='number' min={0} max={65535} value={saveData.items[4]} onChange={handleChange} /></td>
                                <td><label htmlFor='item5'>Item 6.</label><input id='item5' type='number' min={0} max={65535} value={saveData.items[5]} onChange={handleChange} /></td>
                                <td><label htmlFor='item6'>Item 7.</label><input id='item6' type='number' min={0} max={65535} value={saveData.items[6]} onChange={handleChange} /></td>
                                <td><label htmlFor='item7'>Item 8.</label><input id='item7' type='number' min={0} max={65535} value={saveData.items[7]} onChange={handleChange} /></td>
                            </tr>
                        </tbody>
                    </table>
                </details>
            </div>
        );
    }

    return <>
        <FileUI />
        <EditorUI />
    </>
}
root.render(<StrictMode><App /></StrictMode>);