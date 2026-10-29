import { useState, useEffect } from 'react';
import { API_URL } from '../constants/anime';

export function useUserDirectory() {
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await fetch(`${API_URL}/api/admin-panel-fetch-users`);
                if (!res.ok) throw new Error('Could not load users.');

                const data = await res.json();
                
                if (data) { setUsers(data.users); }

            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        }

        fetchUsers();
    }, []);

    return { users: users, loading: loading, error: error };
}

