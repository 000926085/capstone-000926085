
import { useState, useEffect } from 'react';
import { API_URL } from '../constants/anime';

const CACHE_KEY = 'adminDashboard';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const initialDashboard = {
    users: [],
    anime: [],
    apiRes: null,
    timestamp: null,
};

function getCachedDashboard() {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const snapshot = JSON.parse(cached);
        if (!snapshot.timestamp || !snapshot.data) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }

        const age = Date.now() - new Date(snapshot.timestamp).getTime();
        if (age < 0 || age >= CACHE_DURATION) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }

        return snapshot;
    } catch {
        return null;
    }
}

export function useFetchAdminDashboard() {
    const [dashboard, setDashboard] = useState(() => {
        const cached = getCachedDashboard();
        return cached ? cached.data : initialDashboard;
    });

    const [loading, setLoading] = useState(() => !getCachedDashboard());
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            const cached = getCachedDashboard();

            if (cached) {
                setDashboard(cached.data);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const res = await fetch( `${API_URL}/api/fetch-admin-dashboard`);
                if (!res.ok) { throw new Error('An error occurred during your request.');}

                const data = await res.json();
                const apiOnline =
                    data.anime &&
                    (Array.isArray(data.anime)
                        ? data.anime.length > 0
                        : true);

                const snapshot = {
                    users: data.users || [],
                    anime: data.anime || [],
                    apiRes: apiOnline ? 'ONLINE' : 'OFFLINE',
                    timestamp: new Date().toISOString(),
                };

                if (cancelled) return;
                setDashboard(snapshot);
                setError(null);

                try {
                    sessionStorage.setItem(
                        CACHE_KEY,
                        JSON.stringify({
                            timestamp: snapshot.timestamp,
                            data: snapshot,
                        })
                    );
                } catch (storageError) {
                    console.warn(
                        'Could not cache dashboard data:',
                        storageError
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    return { ...dashboard, loading, error };
}