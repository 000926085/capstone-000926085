import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../constants/anime';

export function useRecommendationsMultiple(usernames) {
    const [data, setData] = useState({ anime: [], lastUpdated: null, pfp: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Normalize input to be a comma-separated query string
    const userQueryParam = useMemo(() => {
        if (!usernames) return '';
        const list = Array.isArray(usernames) ? usernames.filter(Boolean) : [usernames];
        return list.join(',');
    }, [usernames]);

    useEffect(() => {
        if (!userQueryParam) {
            setData({ anime: [], lastUpdated: null, pfp: null });
            setLoading(false);
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(false);

        fetch(`${API_URL}/api/blended-recommendations?usernames=${encodeURIComponent(userQueryParam)}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch blended recommendations.");
                return res.json();
            })
            .then(json => {
                if (mounted) {
                    setData({
                        anime: json.planning_anime || [],
                        lastUpdated: json.last_updated || null,
                        group_users: json.group_users || [],
                    });
                }
            })
            .catch(err => {
                console.error("Recommendations fetch failed:", err);
                if (mounted) setError(true);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [userQueryParam]);

    return {
        anime: data.anime,
        lastUpdated: data.lastUpdated,
        group_users: data.group_users,
        loading,
        error
    };
}