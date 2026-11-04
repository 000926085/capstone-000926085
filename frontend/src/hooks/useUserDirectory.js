import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../constants/anime';

export function useUserDirectory() {
    const [users, setUsers] = useState([]);
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

    const sortedUsers = useMemo(() => {
        if (!users) return [];

        return [...users].sort((a, b) => {
            if (a.user_id < b.user_id) return -1;
            if (a.user_id > b.user_id) return 1;
            return 0;
        });
    }, [users]);

    return { users: sortedUsers, loading: loading, error: error };
}

