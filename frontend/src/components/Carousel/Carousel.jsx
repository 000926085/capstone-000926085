import React from 'react'
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll';
import { API_URL, DEFAULT_POSTERS } from '../../constants/anime';
import { openAniListPage } from '../../utils/open_anilist_page';

import styles from './Carousel.module.css';

/**
 * Fetches anime posters from the database and constructs a carousel to display on the home page.
 * @returns {JSX.Element} a carousel of anime posters sourced from the database.
 */
export default function Carousel({ onLoad }) {
    useEffect(() => {
        if (onLoad) { onLoad(); }
    }, [onLoad]);

    const [posters, setPosters] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: 'center', watchDrag: false },
        [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: false })]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 50); 

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchPosters = async () => {
            const cachedPosters = sessionStorage.getItem('anime_carousel_posters');
            if (cachedPosters) {
                try { 
                    setPosters(JSON.parse(cachedPosters));
                    return;
                } catch (e) {
                    sessionStorage.removeItem('anime_carousel_posters');
                }
            }

            try {
                const res = await fetch(`${API_URL}/api/anime-carousel`);

                if (!res.ok) {
                    setPosters(DEFAULT_POSTERS);
                    return;
                }

                const data = await res.json();

                // Shuffle the returned anime and select the first 20 for display.
                const anime = [...data]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 20)
                    .map(item => ({
                        cover: item.cover,
                        anilist_id: item.anilist_id
                    }));

                // If there aren't enough posters, fill in the rest with the default posters.
                const finalPosters = [
                    ...anime,
                    ...DEFAULT_POSTERS.slice(0, (20 - anime.length))
                ]

                sessionStorage.setItem('anime_carousel_posters', JSON.stringify(finalPosters));
                setPosters(finalPosters);
            } catch (err) {
                console.error(err);
                setPosters(DEFAULT_POSTERS);
            }
        };

        fetchPosters();
    }, []);

    return (
        <div className={`${styles['carousel-container']} ${isLoaded ? styles['fade-in'] : ''}`}>
            <h1 className={styles['carousel-slogan']}>Find your new favourite, with AniReco.</h1>
            <div className={`${styles.embla} ${posters.length !== 0 ? styles['fade-in'] : ''}`}>
                <div className={styles['embla__viewport']} ref={emblaRef}>
                    <div className={styles['embla__container']}>
                        {posters.map((anime, i) => {
                            return (
                                <div key={i} className={styles['embla__slide']}>
                                    <img className={styles['anime-poster']} src={anime.cover} onClick={() => openAniListPage(anime.anilist_id)} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}