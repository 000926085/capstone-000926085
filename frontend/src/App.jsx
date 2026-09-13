import { useState, useEffect } from 'react'
import Navbar from "./components/Navbar"
import stars from "./assets/stars.png"
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <div className='container'>
        <form>
          <div className="form-logo-row">
            <img className="site-logo" src={stars} alt="AniReco stars" />
            <div className="title-group">
              <span className="brand-name">AniReco</span>
              <span className="subtitle">Recommendations</span>
            </div>
          </div>
          <label>AniList Username
            <div>
              <input type="text" />
            </div>
          </label>
          <button type="submit">Find Recommendations</button>
        </form>
      </div>
    </>
  )
}

export default App