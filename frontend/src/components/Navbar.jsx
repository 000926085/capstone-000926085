import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import home from '../assets/home.png'
import login from '../assets/login.png'
import "../css/Navbar.css"

/**
 * Constructs a navbar that can be used to reach different endpoints of the website.
 * @returns {JSX.Element} representation of a navbar to access different routes.
 */
export default function Navbar() {
    let navigate = useNavigate();

    return (
        <nav className="nav">
            {/* Site icon, title and slogan. */}
            <div className='nav-info'>
                <img className='site-logo' src={logo}></img>
                <div className='text-group'>
                    <span className='title'>AniReco</span>
                    <span className='slogan'>Tuned to you.</span>
                </div>
            </div>

            {/* Home and login buttons. */}
            <div className='nav-buttons' style={{"gap": "24px"}}>
                <img className='img-button' src={home} title="Home" onClick={() => navigate('/')}></img>
                <img className='img-button' src={login} title="Login"></img>
            </div>
        </nav>
    )
}