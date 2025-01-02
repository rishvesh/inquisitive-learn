import React, { useState } from 'react';
import Layout from '../components/Layout';
import { changePassword } from '../api';
import { useNavigate } from 'react-router-dom';

function ChangePasswordPage() {
    const [ogPassword, setOgPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmation) {
            setError('Passwords do not match.');
            return;
        }
        try {
            await changePassword({ ogpassword: ogPassword, newpassword: newPassword, confirmation });
            navigate('/'); // Redirect on success
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password.');
        }
    };

    return (
        <Layout title="Change Password">
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <input
                        className="form-control mx-auto w-auto"
                        id="ogpassword"
                        name="ogpassword"
                        placeholder="Original Password"
                        type="password"
                        value={ogPassword}
                        onChange={(e) => setOgPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        className="form-control mx-auto w-auto"
                        id="newpassword"
                        name="newpassword"
                        placeholder="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                    Change Password
                </button>
            </form>
        </Layout>
    );
}

export default ChangePasswordPage;