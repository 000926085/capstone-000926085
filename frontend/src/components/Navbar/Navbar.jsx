import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import home from '../../assets/home.png'
import login from '../../assets/login.png'

import AdminNavbar from '../AdminNavbar/AdminNavbar'

import styles from "./Navbar.module.css"

/**
 * Constructs a navbar that can be used to reach different endpoints of the website.
 * @returns {JSX.Element} representation of a navbar to access different routes.
 */
export default function Navbar() {
    let navigate = useNavigate();
    let location = useLocation();
    const [username, setUsername] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('admin_username');
        if (storedUsername) { setUsername(storedUsername); }

        const roleId = localStorage.getItem('admin_role_id');
        if (roleId) { setRole(roleId); }
    }, [location]);

    const isAdminRoute = location.pathname.startsWith('/admin');
    const showWelcome = isAdminRoute && username;

    return (
        <nav className={styles['nav']}>
            {showWelcome ? (
                <>
                    <div className={styles['nav-info-admin']}>
                        <span style={{ fontSize: '32px' }}>
                            <span style={{ fontStyle: 'italic' }}>Welcome, </span>
                            <span style={{ fontWeight: '500' }}>{username}!</span>
                        </span>
                        <div className={styles['role-chip']}>
                            {role == '1' ? "Director" : "Admin"}
                        </div>
                    </div>

                    <AdminNavbar role={role} />
                </>
            ) : (
                <div className={styles['nav-info']} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img className={styles['site-logo']} src={logo} alt="Logo" />
                    <div className={styles['text-group']}>
                        <span className={styles['title']}>AniReco</span>
                        <span className={styles['slogan']}>Tuned to you.</span>
                    </div>
                </div>
            )}

            <div className={styles['nav-buttons']} style={{ gap: "24px" }}>
                <img 
                    className={styles['img-button']} 
                    src={home} 
                    title="Home" 
                    onClick={() => navigate('/')} 
                    alt="Home" 
                />
                <img 
                    className={styles['img-button']} 
                    src={login} 
                    title="Login" 
                    onClick={() => navigate('/login')} 
                    alt="Login" 
                />
            </div>
        </nav>
    );
}