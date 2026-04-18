import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [anime, setAnime] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/fetch-anime/1`)
      .then((res) => res.json())
      .then((data) => {
        setAnime(data); 
      });
  }, []);

  return (
    <>
      <h2>Testing!</h2>
      {anime &&
        <p>AniList ID = {anime.data?.Media?.id}, {anime.data?.Media?.title?.romaji}</p>
      }
    </>
  )
}

export default App
