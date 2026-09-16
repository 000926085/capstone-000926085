import React from 'react'
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll';
import '../css/Carousel.css';

/**
 * Fetches anime posters from the database and constructs a carousel to display on the home page.
 * @returns {JSX.Element} a carousel of anime posters sourced from the database.
 */
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
                    const data = await res.json();

                    // Shuffle the returned anime and select the first 20 for display.
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    setPosters(shuffled.slice(0, 20).map(item => ({
                            cover: item.cover,
                            anilist_id: item.anilist_id
                        }))
                    );
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchPosters();
    }, []);

    // Opens the AniList page of an anime when clicking on it's poster.
    const openAniListPage = (id) => {
        window.open(`https://anilist.co/anime/${id}`)
    }

    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {posters.map((anime, i) => {
                        return (
                            <div key={i} className='embla__slide'>
                                <img className="anime-poster" src={anime.cover} onClick={() => openAniListPage(anime.anilist_id)}></img>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
  )
}