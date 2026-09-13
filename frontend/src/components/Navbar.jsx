import { useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import home from '../assets/home.png'
import login from '../assets/login.png'

export default function Navbar() {
    return (
        <nav className="nav">
            <div className='nav-info'>
                <img className='site-logo' src={logo}></img>
                <div className='text-group'>
                    <span className='title'>AniReco</span>
                    <span className='slogan'>Tuned to you.</span>
                </div>
            </div>
            <div className='nav-buttons'>
                <img className='img-button' src={home}></img>
                <img className='img-button' src={login}></img>
            </div>
        </nav>
    )
}