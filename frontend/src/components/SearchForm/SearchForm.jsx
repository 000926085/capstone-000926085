import { useState } from 'react'
import stars from "../../assets/stars.png"
import './SearchForm.modules.css'

import { useImportUser } from '../../hooks/useImportUser';
import ImportProgress from '../ImportProgress/ImportProgress';

/**
 * Renders a form to collect an AniList username and trigger the import process.
 * @param {Function} onSuccess callback invoked with a valid username after an import
 * @returns {JSX.Element} representation of a form for inputting a username.
 */
export default function SearchForm({ onSuccess, isCarouselLoaded }) {
    const [username, setUsername] = useState('');

    const { importUser, loading, showModal, currentStepIndex, err, STEPS } = useImportUser();
    const handleSubmit = async (e) => {
      e.preventDefault();
      await importUser(username, onSuccess);
    };
    
    return (
      <>
        <form onSubmit={handleSubmit}>
          {/* Form logo and title. */}
          <div className="form-logo-row">
            <img className="site-logo" src={stars} alt="AniReco stars" />
            <div className="title-group">
              <span className="brand-name">AniReco</span>
              <span className="subtitle">Recommendations</span>
            </div>
          </div>

          {/* User input field. */}
          <label>
            AniList Username
            <input type="text" id="username_input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='...'/>
          </label>

          <button type="submit" disabled={loading || !isCarouselLoaded}>
            {loading ? "Loading..." : "Find Recommendations"} 
          </button>
        </form>

        {/* Modal pop-up triggered during import */}
        <ImportProgress 
          isOpen={showModal} 
          currentStepIndex={currentStepIndex} 
          steps={STEPS} 
          err={err} 
        />
    </>
  )
}