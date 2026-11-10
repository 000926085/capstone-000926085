import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import { updatePassword } from '../../utils/updatePassword'

import styles from './AdminSetPassword.module.css'

export default function AdminSetPassword() {
    const location = useLocation();
    const username = location.state?.username;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const data = await updatePassword(username, password);
            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_username', username);
            localStorage.setItem('admin_role_id', data.role);
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className={styles['form-logo-row']}>
                    <div className={styles['title-group']}>
                        <span className='brand-name'>Password Creation</span>
                        <span className='subtitle' style={{ fontSize: '18px' }}>Welcome to your admin account, {username}! Please set a new password.</span>
                    </div>
                </div>

                <label>
                    Password
                    <input
                        type="text"
                        id="password_input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <label>
                    Confirm Password
                    <input
                        type="text"
                        id="confirm_password_input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </label>

                {error && <p style={{ color: 'red', marginBottom: '8px' }}>{error}</p>}

                <button type="submit">Set Password</button>
            </form>
        </div>
    )
}