import { useNavigate } from 'react-router-dom';

import { useFetchAdminDashboard } from '../../hooks/useFetchAdminDashboard';

import "./AdminDashboard.modules.css"

export default function AdminDashboard() {
    const { users, anime, apiRes, timestamp, loading, error } = useFetchAdminDashboard();

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/login', { replace: true });
    };

    console.log(apiRes?.errors);

    return (
        <>
            <div className='card-container'>
                <div className="status-card anime-card">
                    <h2>Total Anime: {anime}</h2>
                </div>

                <div className="status-card users-card">
                    <h2>Total Users: {users.length}</h2>
                </div>

                <div className="status-card api-card">
                    <h2>API Status: ?</h2>
                </div>
            </div>
        </>
    )
}