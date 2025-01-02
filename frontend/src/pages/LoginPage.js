import React, { useState } from 'react';
import Layout from '../components/Layout';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("handleSubmit function called!"); // Added for debugging

        setError('');
        console.log("Attempting to log in with:", {username, password}); // Log the values being sent.
        try {
            // Your login function in api.js handles the actual API call
            const response = await login({ username: username, password: password });
            console.log("Response from API:", response);
            loginSuccess();
            navigate('/');
        } catch (err) {
            console.error("Error from API:", err); // Log the full error object
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <Layout title="Log In">
            <form onSubmit={handleSubmit} method="post"> {/* Keep method="post" */}
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
                <button className="btn btn-primary" type="submit">
                    Log In
                </button>
            </form>
        </Layout>
    );
}

export default LoginPage;