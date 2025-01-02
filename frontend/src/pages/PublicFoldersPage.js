import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getPublicFolders } from '../api';
import { Link } from 'react-router-dom';

function PublicFoldersPage() {
    const [folders, setFolders] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getPublicFolders(search);
                setFolders(response.data);
            } catch (error) {
                console.error("Error fetching public folders:", error);
                setError('Failed to load public folders.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    return (
        <Layout title="Public Folders">
            <h1>Public Folders</h1>

            <form className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search folders"
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                        Search
                    </button>
                </div>
            </form>

            <div className="row">
                {loading && <p>Loading public folders...</p>}
                {error && <p className="text-danger">{error}</p>}
                {folders.map(folder => (
                    <div className="col-md-4 mb-3" key={folder.id}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{folder.name}</h5>
                                <p className="card-text">Created by: {folder.username}</p>
                                <Link to={`/view_folder/${folder.id}`} className="btn btn-outline-primary mt-auto">
                                    View Questions
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {folders.length === 0 && !loading && <p>No public folders found.</p>}
            </div>
        </Layout>
    );
}

export default PublicFoldersPage;