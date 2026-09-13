import { useState, useEffect } from 'react'
import Navbar from "./components/Navbar"
import stars from "./assets/stars.png"
import './App.css'

function App() {
  const [username, setUsername] = useState('');
  const [err, setErr] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!username.trim()) { 
      setErr("Please enter a username.")
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/user-exists/${username.trim()}`);
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
      <Navbar />
      <div className='container'>
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
          {err && (
            <p className="error-message">{err}</p>
          )}
          <button type="submit">Find Recommendations</button>
        </form>
      </div>
    </>
  )
}

export default App