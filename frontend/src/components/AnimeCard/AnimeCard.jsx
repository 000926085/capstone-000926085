import React, { useState, useRef, useLayoutEffect } from 'react';
import { openAniListPage } from '../../utils/open_anilist_page';
import { getScoreColour } from '../../utils/getScoreColour';

import './AnimeCard.modules.css'

import AffinityBreakdown from '../AffinityBreakdown/AffinityBreakdown';

/**
 * Constructs a card containing preliminary data about an anime to be shown as recommendations.
 * @param {Object} anime representation of a singular anime to be made into an AnimeCard.
 * @param {Number} rec_length amount of recommendations to make into AnimeCards, needed for the rank.
 * @returns {JSX.Element} a graphical representation of an anime.
 */
export default function AnimeCard({anime = {}, rec_length}) {
    const title = (anime.title?.romaji || anime.title?.english || "");

    const MAX_TAGS = 5;
    const genres = anime.genres || [];
    const rawTags = anime.tags || [];
    const tags = rawTags.sort((a, b) => b.similarity - a.similarity) || [];
    const visibleTags = tags.slice(0, MAX_TAGS);
    const remainingCount = tags.length - MAX_TAGS;

    return (
        <div className="anime-card" data-testid="anime-card">
            <div className="card-poster-wrapper">
                <img src={anime.cover} alt={title} title={`View ${title} on AniList`}className="card-poster" onClick={() => openAniListPage(anime.anilist_id)}/>
            </div>

            <div className="card-content">
                {/* Header, title, points from algorithm and rank compared to other anime. */}
                <div className="card-header">
                    <div className="rank-container">
                        <span className="rank-badge">#{anime.rank}</span>
                        <span className="total-count">of {rec_length}</span>
                    </div>
                    <span className="points-badge" onClick={() => console.log(anime.desirability)}>{anime.desirability?.total_score} pts</span>
                </div>

                <h3 className="anime-title" data-testid="anime-card-title">
                    {title}
                </h3>

                {/* Genre and tag indicators. */}
                <div className="attributes-container">
                    {genres.map((genre) => (
                        <span key={typeof genre === 'object' ? genre.name : genre} className="chip genre-chip">
                            {typeof genre === 'object' ? genre.name : genre}
                        </span>
                    ))}

                    {visibleTags.map((tag) => {
                        const tagName = typeof tag === 'object' ? tag.name : tag;
                        return (
                            <span key={tagName} className="chip tag-chip">
                                {tagName}
                            </span>
                        );
                    })}

                    {remainingCount > 0 && (
                        <span className="chip count-chip">+{remainingCount} more</span>
                    )}
                </div>

                {/* Footer, AniList score, popularity and button for details. */}
                <div className="card-footer">
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-label">Score</span>
                            <span className="stat-value highlight" style={{color: getScoreColour(anime.mean_score)}}>{anime.mean_score}%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Popularity</span>
                            <span className="stat-value">{(anime.popularity).toLocaleString()}</span>
                        </div>
                    </div>
                    <button className="details-btn">
                        Details <span className="btn-arrow">→</span>
                    </button>
                </div>
            </div>
            {/* <AffinityBreakdown desirability={anime.desirability}/> */}
        </div>
    );
}