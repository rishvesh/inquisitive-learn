import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getIndexData, createFolder } from '../api';
import { Link } from 'react-router-dom';

function HomePage() {
    const [username, setUsername] = useState('');
    const [folders, setFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getIndexData();
                setUsername(response.data.username);
                setFolders(response.data.folders);
            } catch (error) {
                console.error("Error fetching index data:", error);
                setError('Failed to load data.');
            }
        };
        fetchData();
    }, []);

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createFolder({ name: newFolderName, is_public: isPublic });
            // Refresh folders after creating
            const response = await getIndexData();
            setFolders(response.data.folders);
            setNewFolderName('');
            setIsPublic(false);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to create folder.');
        }
    };

    return (
        <Layout title="Quote">
            <div className="container mt-5">
                <h1 className="text-center mb-4">Welcome, {username}</h1>
                <hr className="mb-5" />

                <div className="text-center mb-5">
                    <Link to="/upload" className="btn btn-primary btn-lg" style={{ width: '60%' }}>
                        <i className="fas fa-file-upload mr-2"></i> Upload A PDF
                    </Link>
                </div>

                <h2 className="text-center mb-4">My Folders</h2>
                <div className="row">
                    {folders.map(folder => (
                        <div className="col-md-4 mb-4" key={folder.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{folder.name}</h5>
                                    <p className="card-text">
                                        {folder.public ? (
                                            <span className="badge bg-info">Public</span>
                                        ) : (
                                            <span className="badge bg-secondary">Private</span>
                                        )}
                                    </p>
                                    <Link to={`/view_folder/${folder.id}`} className="btn btn-outline-primary mt-auto">
                                        View Questions
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {folders.length === 0 && (
                        <div className="col-12 text-center">
                            <p className="text-muted">You don't have any folders yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-5">
                    <h3 className="text-center mb-4">Create a New Folder</h3>
                    <form onSubmit={handleCreateFolder} className="mb-4 max-w-md mx-auto">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="New folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="is_public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="is_public">
                                Make folder public
                            </label>
                        </div>
                        <button type="submit" className="btn btn-success btn-block">
                            Create Folder
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default HomePage;