import { useState } from 'react'
import stars from "../assets/stars.png"
import '../App.css'

/**
 * Renders a form to collect an AniList username and trigger the import process.
 * @param {Function} onSuccess callback invoked with a valid username after an import
 * @returns {JSX.Element} representation of a form for inputting a username.
 */
export default function SearchForm({onSuccess}) {
    const [username, setUsername] = useState('');
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    /**
     * Handles the form submission, input validation and triggering the callback.
     * @param {<HTMLFormElement>} e form submission event.
     * @returns 
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
    
        // handles empty input.
        if (!username.trim()) { 
          setErr("Please enter a username.")
          return;
        }
        
        setLoading(true);

        // attempt to import the user by calling the AniList API.
        try {
          const res = await fetch(`http://localhost:8000/api/import-anilist-user/${username.trim()}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }
          });
    
          if (!res.ok) {
            const err = await res.json();
            setErr(err.detail || "An unexpected error occurred.");
            return;
          }

          // redirect to the recommendations route on success.
          onSuccess(username.trim());

        } catch (err) {
            setErr("Failed to connect to the server.")
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
                <div style={{"display": "flex", "flexDirection": "row"}}>
                  <p className="loading-message">Loading...</p>
                </div>
              )}
              {err && (
                <p className="error-message">{err}</p>
              )}
              <button type="submit">Find Recommendations</button>
            </form>
        </>
      )
}