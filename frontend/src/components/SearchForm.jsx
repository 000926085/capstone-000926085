import { useState } from 'react'
import stars from "../assets/stars.png"
import '../App.css'

export default function SearchForm() {
    const [username, setUsername] = useState('');
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    // 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
    
        // handles empty input.
        if (!username.trim()) { 
          setErr("Please enter a username.")
          return;
        }
        
        setLoading(true);

        try {
          const res = await fetch(`http://localhost:8000/api/import-anilist-user/${username.trim()}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }
          });
    
          if (!res.ok) {
            const err = await res.json();
            setErr(err.detail);
            return;
          }
        } catch (err) {
            setErr("Failed to connect to the AniList API.")
        } finally {
          setLoading(false);
        }
      }
    
      return (
        <>
            <form onSubmit={handleSubmit}>
              <div className="form-logo-row">
                <img className="site-logo" src={stars} alt="AniReco stars" />
                <div className="title-group">
                  <span className="brand-name">AniReco</span>
                  <span className="subtitle">Recommendations</span>
                </div>
              </div>
              <label>
                AniList Username
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='...'/>
              </label>
              {loading && (
                <p className="loading-message">Loading...</p>
              )}
              {err && (
                <p className="error-message">{err}</p>
              )}
              <button type="submit">Find Recommendations</button>
            </form>
        </>
      )
}