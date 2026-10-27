import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateAdmin } from '../../hooks/useCreateAdmin';

import styles from './AdminSetup.module.css';

export default function AdminSetup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { createAccount, loading, error, successMessage } = useCreateAdmin();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const success = await createAccount(username, password, 2);
        if (success) {
            setUsername('');
            setPassword('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 style={{color: 'black'}}>Create New Admin Account</h2>
            <label>Username
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
            </label>
            <label>
                Password
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </label>

            {error && <div style={{ color: 'red' }}>{error}</div>}
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button type="button" onClick={() => navigate('/admin-dashboard')}>
                Back to Dashboard
            </button>
        </form>
    );
}