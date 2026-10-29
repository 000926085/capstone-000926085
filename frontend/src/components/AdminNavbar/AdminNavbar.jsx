import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import styles from  "./AdminNavbar.module.css"

export default function AdminNavbar({role}) {
    let navigate = useNavigate();
    let location = useLocation();

    const isActive = (path) => location.pathname === path;
    
    return (
        <div className={styles['nav-links']}>
                <span  className={`${styles['nav-item']} ${isActive('/admin-dashboard') ? styles['active'] : ''}`} onClick={() => navigate('/admin-dashboard')}>
                    Dashboard
                </span>
                <span className={styles['divider']}>|</span>
                
                <span className={`${styles['nav-item']} ${isActive('/anime-management') ? styles['active'] : ''}`} onClick={() => navigate('/anime-management')}>
                    Anime Management
                </span>
                <span className={styles['divider']}>|</span>
                
                <span className={`${styles['nav-item']} ${isActive('/admin-user-directory') ? styles['active'] : ''}`} onClick={() => navigate('/admin-user-directory')}>
                    User Directory
                </span>

                {role === '1' && (
                    <>
                        <span className={styles['divider']}>|</span>
                        <span className={`${styles['nav-item']} ${isActive('/admin-setup') ? styles['active'] : ''}`} onClick={() => navigate('/admin-setup')}>
                            Admin Setup
                        </span>
                    </>
                )}
            </div>
    )
}