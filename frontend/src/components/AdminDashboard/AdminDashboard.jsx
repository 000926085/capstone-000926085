import { useNavigate } from 'react-router-dom';

import { useFetchUsers } from '../../hooks/useFetchUsers';

import "./AdminDashboard.modules.css"

export default function AdminDashboard() {
    const { users, message } = useFetchUsers();

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/login', { replace: true });
    };

    return (
        <div className="admin-container">
            <h1>Welcome to the Admin Page!</h1>
            {users && users.length > 0 ? (
                users.map((u) => (
                    <p key={u.user_id}>{JSON.stringify(u)}</p>
                ))
                ) : (
                <p>{message}</p>
            )}
            <button onClick={handleLogout} data-testid="logout">Sign out</button>
        </div>
    )
}