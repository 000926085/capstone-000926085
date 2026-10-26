import { useState, useEffect } from 'react';

export function useFetchAdminDashboard() {
    const [dashboard, setDashboard] = useState({
        users: [],
        anime: [],
        apiRes: null,
        timestamp: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/fetch-admin-dashboard');
                if (!res.ok) throw new Error("An error occured during your request.");
                const data = await res.json();

                if (data) {
                    console.log(data);
                    setDashboard({
                        users: data.users || [],
                        anime: data.anime || [],
                        apiRes: data.api_res || 'ONLINE',
                        timestamp: data.users?.timestamp || new Date().toISOString()
                    });
                }
            } catch (err) { 
                console.error(err); 
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { ...dashboard, loading, error };
}