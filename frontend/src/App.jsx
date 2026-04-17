import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    fetch(`http://localhost:8000/api/hello`)
      .then((res) => res.json())
      .then((data) => {
        setMsg(data.message); 
      });
  }, []);

  return (
    <>
      <h2>Testing!</h2>
      {msg &&
        <p>{msg}</p>
      }
    </>
  )
}

export default App
