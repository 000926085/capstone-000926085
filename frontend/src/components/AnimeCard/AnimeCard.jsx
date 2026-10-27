import React, { useState, useRef, useLayoutEffect } from 'react';

import { openAniListPage } from '../../utils/open_anilist_page';
import { getScoreColour } from '../../utils/getScoreColour';

import AffinityBreakdown from '../AffinityBreakdown/AffinityBreakdown';
import InformationPage from '../InformationPage/InformationPage';

import styles from './AnimeCard.module.css';

/**
 * Constructs a card containing preliminary data about an anime to be shown as recommendations.
 * @param {Object} anime representation of a singular anime to be made into an AnimeCard.
 * @param {Number} rec_length amount of recommendations to make into AnimeCards, needed for the rank.
 * @returns {JSX.Element} a graphical representation of an anime.
 */
export default function AnimeCard({anime = {}, rec_length}) {
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [isInformationOpen, setIsInformationOpen] = useState(false);

    const title = (anime.title?.romaji || anime.title?.english || "");
    const MAX_TAGS = 10;

    const genres = anime.genres || [];
    const tags = [...(anime.tags || [])].sort(
        (a, b) => b.similarity - a.similarity
    );

    const visibleTags = tags.slice(0, MAX_TAGS);
    const remainingCount = tags.length - MAX_TAGS;

    return (
        <div className={styles['anime-card']} data-testid="anime-card">
            <div className={styles['card-poster-wrapper']}>
                <img src={anime.cover} alt={title} title={`View ${title} on AniList`} className={styles['card-poster']} onClick={() => openAniListPage(anime.anilist_id)}/>
            </div>

            <div className={styles['card-content']}>
                {/* Header, title, points from algorithm and rank compared to other anime. */}
                <div className={styles['card-header']}>
                    <div className={styles['rank-container']}>
                        <span className={styles['rank-badge']}>#{anime.rank}</span>
                        <span className={styles['total-count']}>of {rec_length}</span>
                    </div>
                    <span 
                        className={styles['points-badge']}
                        onClick={() => setIsBreakdownOpen(true)}>
                        {anime.desirability?.total_score} pts
                    </span>
                </div>

                <h3 className={styles['anime-title']} data-testid="anime-card-title">
                    {title}
                </h3>

                {/* Genre and tag indicators. */}
                <div className={styles['attributes-container']}>
                    {genres.map((genre) => (
                        <span  key={typeof genre === 'object' ? genre.name : genre} className={`${styles.chip} ${styles['genre-chip']}`}>
                            {typeof genre === 'object' ? genre.name : genre}
                        </span>
                    ))}

                    {visibleTags.map((tag) => {
                        const tagName = typeof tag === 'object' ? tag.name : tag;
                        return (
                            <span key={tagName} className={`${styles.chip} ${styles['tag-chip']}`}>
                                {tagName}
                            </span>
                        );
                    })}

                    {remainingCount > 0 && (
                        <span className={`${styles.chip} ${styles['count-chip']}`}>+{remainingCount} more</span>
                    )}
                </div>

                {/* Footer, AniList score, popularity and button for details. */}
                <div className={styles['card-footer']}>
                    <div className={styles['stats-row']}>
                        <div className={styles['stat-item']}>
                            <span className={styles['stat-label']}>Score</span>
                            <span className={`${styles.highlight} ${styles['stat-value']}`} style={{color: getScoreColour(anime.mean_score)}}>{anime.mean_score}%</span>
                        </div>
                        <div className={styles['stat-item']}>
                            <span className={styles['stat-label']}>Popularity</span>
                            <span className={styles['stat-value']}>{(anime.popularity).toLocaleString()}</span>
                        </div>
                    </div>
                    <button className={styles['details-btn']} data-testid="details-btn" onClick={() => setIsInformationOpen(true)}>
                        Details <span className={styles['btn-arrow']}>→</span>
                    </button>
                </div>
            </div>

            {isBreakdownOpen && (
                <AffinityBreakdown
                    desirability={anime.desirability}
                    title={title}
                    onClose={() => setIsBreakdownOpen(false)}
                />
            )}
            {isInformationOpen && (
                <InformationPage 
                    anime_id={anime?.anilist_id}
                    onClose={() => setIsInformationOpen(false)}
                />
            )}
        </div>
    );
}