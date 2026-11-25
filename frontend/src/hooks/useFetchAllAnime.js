import { useState, useEffect } from 'react';
import { API_URL } from '../constants/anime';

export function useFetchAllAnime() {
    const [allAnime, setAllAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnime = async () => {
            try {
                const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const response = await fetch(`${API_URL}/api/fetch-all-anime`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Failed to fetch anime.');
                }

                const data = await response.json();
                if (data) { setAllAnime(data); }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAnime();
    }, []);

    return { anime: allAnime, loading: loading, error: error };
}