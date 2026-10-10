import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useState } from 'react'

import Navbar from "./components/Navbar/Navbar"
import SearchForm from './components/SearchForm/SearchForm'
import Recommendations from './components/Recommendations/Recommendations'
import Carousel from './components/Carousel/Carousel'

import './App.css'

function App() {
  const location = useLocation();
  const [isCarouselLoaded, setIsCarouselLoaded] = useState(false);

  return (
    <div className='wrapper'>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Landing page, search form. */}
          <Route path="/" element={<Home isCarouselLoaded={isCarouselLoaded} />} />

          {/* Recommendations page. */}
          <Route path="/recommendations/:username" element={<Recommendations />} />
        </Routes>
      </main>
      
      {location.pathname === '/' && (
        <Carousel onLoad={() => setIsCarouselLoaded(true)} />
      )}
    </div>
  )
}

function Home({ isCarouselLoaded }) {
  const navigate = useNavigate();
  const handleUserImported = (username) => {
    navigate(`/recommendations/${username}`);
  };

  return <SearchForm onSuccess={handleUserImported} isCarouselLoaded={isCarouselLoaded} />;
}

export default App