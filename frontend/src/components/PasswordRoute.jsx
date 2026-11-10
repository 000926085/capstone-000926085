import { Navigate, useLocation } from 'react-router-dom';

export default function PasswordRoute({ children }) {
    const location = useLocation();
    const canChange = location.state?.canChangePassword;

    if (!canChange) { return <Navigate to="/login" replace />; }
    
    return children;
};
