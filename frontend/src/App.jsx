import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import Navbar from "./components/Navbar/Navbar"
import SearchForm from './components/SearchForm/SearchForm'
import Recommendations from './components/Recommendations/Recommendations'
import Carousel from './components/Carousel/Carousel'
import './App.css'

function App() {
  const location = useLocation();

  return (
    <div className='wrapper'>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Landing page, search form. */}
          <Route path="/" element={<Home />} />

          {/* Recommendations page. */}
          <Route path="/recommendations/:username" element={<Recommendations />} />
        </Routes>
      </main>
      
      {location.pathname === '/' && <Carousel />}
    </div>
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