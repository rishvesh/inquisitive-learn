import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getFolders, addToFolder, pushFolder } from '../api';

function FolderPopup({ isVisible, position, question, answer, onClose }) {
    const [folders, setFolders] = useState([]);
    const [isNewFolderFormVisible, setIsNewFolderFormVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isPublicFolder, setIsPublicFolder] = useState(false);
    const popupRef = useRef(null);

    const fetchAvailableFolders = useCallback(async () => {
        try {
            const privateFoldersResponse = await getFolders(false);
            setFolders([...privateFoldersResponse.data]);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    }, []);

    useEffect(() => {
        if (isVisible) {
            fetchAvailableFolders();
        }
    }, [isVisible, fetchAvailableFolders]);

    const handleAddToFolder = useCallback(async (folderId) => {
        try {
            await addToFolder({ question: question, answer: answer, folder_id: folderId });
            onClose();
        } catch (error) {
            console.error("Error adding to folder:", error);
        }
    }, [question, answer, onClose]);

    const handleCreateNewFolder = useCallback(async (event) => {
        event.preventDefault();
        try {
            await pushFolder({ name: newFolderName, public: isPublicFolder });
            fetchAvailableFolders();
            setNewFolderName('');
            setIsPublicFolder(false);
            setIsNewFolderFormVisible(false);
        } catch (error) {
            console.error("Error creating folder:", error);
        }
    }, [fetchAvailableFolders, newFolderName, isPublicFolder]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef, onClose]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            id="folderPopup"
            className="show" // Always show when isVisible is true
            style={{ top: position.top, left: position.left }}
            ref={popupRef}
        >
            <FolderList   folders={folders} handleAddToFolder={handleAddToFolder}  />
            <hr />
            <button id="showNewFolderForm" className="btn btn-outline-primary btn-sm mt-2" onClick={() => setIsNewFolderFormVisible(true)}>New Folder</button>
            <NewFolderForm
                isNewFolderFormVisible={isNewFolderFormVisible}
                handleCreateNewFolder={handleCreateNewFolder}
                newFolderName={newFolderName}
                setNewFolderName={setNewFolderName}
                isPublicFolder={isPublicFolder}
                setIsPublicFolder={setIsPublicFolder}
            />
        </div>
    );
}

function NewFolderForm({ isNewFolderFormVisible, handleCreateNewFolder, newFolderName, setNewFolderName, isPublicFolder, setIsPublicFolder }) {
    return (
        <form id="newFolderForm" className={isNewFolderFormVisible ? 'show' : ''} onSubmit={handleCreateNewFolder}>
            <div className="input-group mb-2">
                <input
                    type="text"
                    id="newFolderInput"
                    className="form-control"
                    placeholder="New folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
                <div className="input-group-append">
                    <button className="btn btn-primary" type="submit">Create</button>
                </div>
            </div>
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="publicFolderCheck"
                    checked={isPublicFolder}
                    onChange={(e) => setIsPublicFolder(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="publicFolderCheck">
                    Make folder public
                </label>
            </div>
        </form>
    );
}


function FolderList({folders, handleAddToFolder}) {
    return (<div id="folderList">
            {folders.map(folder => <button key={folder.id} className={`btn btn-outline-secondary btn-sm m-1 folder-btn ${folder.public === 'y' ? 'btn-info' : ''}`} title={folder.public === 'y' ? 'Public folder' : ''} onClick={() => handleAddToFolder(folder.id)}>
                    {folder.public === 'y' ? `${folder.name} (by ${folder.username})` : folder.name}
                </button>)}
        </div>);
}

export default FolderPopup;