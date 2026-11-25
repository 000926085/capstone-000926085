import { Navigate } from 'react-router-dom';

export default function DirectorRoute({ children }) {
    const token = sessionStorage.getItem('admin_token');
    const roleId = sessionStorage.getItem('admin_role_id');

    if (!token) { return <Navigate to="/login" replace />; }
    if (roleId !== '1') { return <Navigate to="/admin-dashboard" replace />; }

    return children;
}