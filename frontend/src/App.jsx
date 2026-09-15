import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from "./components/Navbar"
import SearchForm from './components/SearchForm'
import Recommendations from './components/Recommendations'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Landing page, search form. */}
          <Route path="/" element={<Home />} />

          {/* Recommendations page. */}
          <Route path="/recommendations/:username" element={<Recommendations />} />
        </Routes>
      </main>
    </>
  )
}

function Home() {
  const navigate = useNavigate();
  const handleUserImported = (username) => {
    navigate(`/recommendations/${username}`);
  };

  return <SearchForm onSuccess={handleUserImported} />;
}

export default App