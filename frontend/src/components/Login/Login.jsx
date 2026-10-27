import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import wheel from "../../assets/wheel.png"

import { attemptLogin } from '../../utils/attemptLogin'

import styles from './Login.module.css'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    // Redirect to the dashboard if already logged in.
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            navigate('/admin-dashboard', { replace: true });
        }
    }, [navigate]);

    // Attempt a login.
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError('');

        try {
            const data = await attemptLogin(username, password);
            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_username', username);
            localStorage.setItem('admin_role_id', data.role);
            navigate('/admin-dashboard'); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className={styles['form-logo-row']}>
                    <img className='site-logo' src={wheel} alt="Admin wheel icon." />
                    <div className={styles['title-group']}>
                        <span className='brand-name'>AniReco</span>
                        <span className='subtitle'>Admin Panel</span>
                    </div>
                </div>

                <label>
                    Username
                    <input
                        type="text"
                        id="username_input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        data-testid="username-input"
                    />
                </label>

                <label>
                    Password
                    <div className={styles['password-row']}>
                        <input
                            type={showPassword ? 'text' : 'password'} 
                            id="password_input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            data-testid="password-input"
                        />
                        <button
                            type="button"
                            className={styles['password-toggle-btn-beside']}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                            data-testid="toggle-visibility"
                        >
                            {showPassword ? (
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                </label>

                {error && <div className={styles['error-message']} style={{ color: 'red' }} data-testid="error-msg">{error}</div>}
                <button type="submit" data-testid="sign-in-button">Sign In</button>
            </form>
        </>
    )
}