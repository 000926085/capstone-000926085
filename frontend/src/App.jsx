import { useState, useEffect } from 'react'
import Navbar from "./components/Navbar"
import SearchForm from './components/SearchForm'
import './App.css'

function App() {
  const [userdata, setUserdata] = useState(null);

  return (
    <>
      <Navbar />
      <main className="container">
        {!userdata ? (
          <SearchForm />
        ) : (
          <p>Hi</p>
        )}
      </main>
    </>
  )
}

export default App