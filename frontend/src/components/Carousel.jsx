import React from 'react'
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll';
import '../css/Carousel.css';

export default function Carousel() {
    let [posters, setPosters] = useState([]);
    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: 'center', watchDrag: false },
        [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: false })]
    );

    useEffect(() => {
        const fetchPosters = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/anime-carousel`);
                if (res.ok) { 
                    // shuffle the returned anime and select the first 20 for display.
                    const data = await res.json();
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    setPosters(shuffled.slice(0, 20).map(item => item.cover));
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchPosters();
    }, []);

    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {posters.map((url, i) => {
                        return (
                            <div key={i} className='embla__slide'>
                                <img className="anime-poster" src={url} alt={url}></img>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
  )
}