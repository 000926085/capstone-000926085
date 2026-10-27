import { useState, useEffect } from 'react';
import { API_URL } from '../../constants/anime';

export function useFetchAniListDetails({anime_id}) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (anime_id == null || anime_id === "") { return; }
        const fetchDetails = async () => {

            setLoading(true);
            setError('');

            try {
                const res = await fetch(`${API_URL}/api/fetch-anilist-details/${anime_id}`);
                console.log(res);
                
                if (!res.ok) throw new Error('Could not load anime details');
                
                const data = await res.json();
                console.log(data);
                if (data) { 
                    setDetails(data);
                } 
                
            } catch (err) { 
                setError(err.message); 
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    return { details: details, loading: loading, error: error };
}