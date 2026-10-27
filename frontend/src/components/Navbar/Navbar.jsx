import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import home from '../../assets/home.png'
import login from '../../assets/login.png'

import styles from  "./Navbar.module.css"

/**
 * Constructs a navbar that can be used to reach different endpoints of the website.
 * @returns {JSX.Element} representation of a navbar to access different routes.
 */
export default function Navbar() {
    let navigate = useNavigate();

    return (
        <nav className={styles['nav']}>
            {/* Site icon, title and slogan. */}
            <div className={styles['nav-info']} onClick={() => navigate('/')}>
                <img className='site-logo' src={logo}></img>
                <div className={styles['text-group']}>
                    <span className={styles['title']}>AniReco</span>
                    <span className={styles['slogan']}>Tuned to you.</span>
                </div>
            </div>

            {/* Home and login buttons. */}
            <div className={styles['nav-buttons']} style={{"gap": "24px"}}>
                <img className={styles['img-button']} src={home} title="Home" onClick={() => navigate('/')}></img>
                <img className={styles['img-button']} src={login} title="Login" onClick={() => navigate('/login')}></img>
            </div>
        </nav>
    )
}