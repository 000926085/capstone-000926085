// hooks/useRecommendations.js
import { useState, useEffect } from 'react';

/**
 * Responsible for fetching the planning data.
 * @param {string} username the username of the user we are fetching the planning data of. 
 * @returns an object containing the anime list, when it was last updated, loading state and, if applicable, an error message.
 */
export function useRecommendations(username) {
    const [anime, setAnime] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(false);

            try {
                const res = await fetch(`http://localhost:8000/api/fetch-planning-data/${username}`);
                if (!res.ok) throw new Error("User not found.");
                
                const data = await res.json();

                if (mounted) {
                    setAnime(data.planning_anime || []);
                    setLastUpdated(data.last_updated || null);
                }
            } catch (err) {
                console.error(err);
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (username) fetchData();

        return () => { mounted = false; };
    }, [username]);

    return { anime, lastUpdated, loading, error };
}