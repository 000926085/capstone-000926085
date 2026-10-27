import { useNavigate } from 'react-router-dom';

import { useFetchAdminDashboard } from '../../hooks/useFetchAdminDashboard';

import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const { users, anime, apiRes, timestamp, loading, error } = useFetchAdminDashboard();

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_role_id');
        navigate('/login', { replace: true });
    };

    return (
        <>
            <div className={styles['card-container']}>
                <div className={`${styles['status-card']} ${styles['anime-card']}`}>
                    <h2>Total Anime: {anime}</h2>
                </div>

                <div className={`${styles['status-card']} ${styles['users-card']}`}>
                    <h2>Total Users: {users.length}</h2>
                </div>

                <div className={`${styles['status-card']} ${styles['api-card']}`}>
                    <h2>API Status: {apiRes}</h2>
                </div>
            </div>

            <button onClick={handleLogout} data-testid="logout">Logout</button>
        </>
    );
}