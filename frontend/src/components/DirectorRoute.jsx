import { Navigate } from 'react-router-dom';

export default function DirectorRoute({ children }) {
    const token = localStorage.getItem('admin_token');
    const roleId = localStorage.getItem('admin_role_id');

    if (!token) { return <Navigate to="/login" replace />; }
    if (roleId !== '1') { return <Navigate to="/admin-dashboard" replace />; }

    return children;
}