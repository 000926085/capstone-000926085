import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css'

export default function Recommendations() {
    const { username } = useParams();
    const [userExists, setUserExists] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/user-exists/${username}`);
                
                if (res.ok) { setUserExists(true); }
                else { setUserExists(false); }

            } catch (err) {
                console.error(err);
                setUserExists(false);
            }
        }

        checkUser();
    }, [username]);

    if (!userExists || userExists === null) {
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
            <h2>Recommendations for {username}</h2>
        </div>
    );
}