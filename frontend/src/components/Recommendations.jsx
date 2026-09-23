import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/Recommendations.css'

export default function Recommendations() {
    const { username } = useParams();
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState(["PLANNING","PAUSED"]);

    useEffect(() => {
        let mounted = true;

        const checkUser = async () => {
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:8000/api/fetch-anime-list/${username}`);
                if (!res.ok) { throw new Error ("User not found."); }

                const data = await res.json();
                console.log(data);
                if (mounted) { setAnime(data["anime"] || []); }
            } catch (err) {
                console.error(err);
                if (mounted) { setError(true); }
            } finally {
                if (mounted) { setLoading(false); }
            }
        }

        checkUser();
        return () => { mounted = false; }
    }, [username]);

    // Show a loading indicator while fetching.
    if (loading) {
        return (
            <div className="status-container">
                <h2 className="brand-name">Loading...</h2>
            </div>
        );
    }

    // If a user is unable to be found, display a form.
    if (error) {
        return (
            <form>
                <h2 className="brand-name">User Not Found</h2>
                <p className="error-subtitle">An AniList account with the username {username} does not exist.</p>
                <Link className="link" to="/">Return Home</Link>
            </form>
        )
    }

    return (
        <div className="recommendations-container">
            <h2 style={{color: 'black'}}>Recommendations for {username}</h2>
            <ul>
                {anime
                    .filter((item) => selectedStatuses.includes(item.list_status))
                    .map((a, index) => ( 
                        <li key={a.anime_id || index}> 
                            <p>{a.title.romaji || a.title.english}</p> 
                            <p>{JSON.stringify(a)}</p> 
                            <img src={a.cover} alt={a.title.english || "Anime Cover"}></img> 
                        </li> 
                    ))
                } 
            </ul>
        </div>
    );
}