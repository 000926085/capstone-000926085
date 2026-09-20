import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css'

export default function Recommendations() {
    const { username } = useParams();
    const [userExists, setUserExists] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkUser = async () => {
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:8000/api/user-exists/${username}`);
                if (mounted) { setUserExists(res.ok); }
            } catch (err) {
                console.error(err);
                if (mounted) { setUserExists(false); }
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
    if (!userExists) {
        return (
            <form>
                <h2 className="brand-name">User Not Found</h2>
                <p className="error-subtitle">An AniList account with the username {username} does not exist.</p>
                <Link className="link" to="/">Return Home</Link>
            </form>
        )
    }

    // If a user is found, show the recommendations.
    return (
        <div className="recommendations-container">
            <h2>Recommendations for {username}</h2>
        </div>
    );
}