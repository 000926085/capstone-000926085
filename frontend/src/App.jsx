import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [anime, setAnime] = useState(null);

  let username = "sa000926085"
  useEffect(() => {
    fetch(`http://localhost:8000/api/import-anilist-user/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAnime(data); 
      });
  }, []);

  if (!anime) { return; }
  console.log(anime.content);

  return (
    <>
      <h2>{anime.message}</h2>
    </>
  )
}

export default App
