import { useState } from 'react';
import { API_URL } from '../constants/anime';

export function useCreateAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const createAccount = async (username, password, roleId) => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`${API_URL}/api/create-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    username, 
                    password, 
                    role_id: parseInt(roleId) 
                }),
            });

            const errorData = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(errorData.detail || 'Failed to create account.');
            }

            setSuccessMessage(`Successfully created account for "${username}"!`);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createAccount, loading, error, successMessage };
}