import React, { useState } from 'react';
import Layout from '../components/Layout';
import { register } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmation) {
            setError('Passwords do not match.');
            return;
        }
        try {
            await register({ username: username, password: password, confirmation: confirmation });
            loginSuccess();
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <Layout title="Register">
            <form onSubmit={handleSubmit} method="post"> {/* Add method="post" */}
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <input
                        autoComplete="off"
                        autoFocus
                        className="form-control mx-auto w-auto"
                        id="username"
                        name="username"
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        className="form-control mx-auto w-auto"
                        id="password"
                        name="password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        className="form-control mx-auto w-auto"
                        id="confirmation"
                        name="confirmation"
                        placeholder="Confirm Password"
                        type="password"
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        required
                    />
                </div>
                <button className="btn btn-primary" type="submit">
                    Register
                </button>
            </form>
        </Layout>
    );
}

export default RegisterPage;