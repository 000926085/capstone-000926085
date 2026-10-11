import { useMemo, useState } from "react";
import './AffinityBreakdown.modules.css'

const CATEGORY_INFO = {
    genres: { label: "Genres", multiplierKey: "genre_multiplier" },
    tags: { label: "Tags", multiplierKey: "tag_multiplier" },
    studios: { label: "Studios", multiplierKey: "studio_multiplier" },
    directors: { label: "Directors", multiplierKey: "director_multiplier" }
};

/**
 * Helper function to properly format the points awarded for display.
 * @param {Number} value the points value we are checking.
 * @returns a formatted string to display in the points breakdown.
 */
function formatPoints(value) {
    const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    const normalized = Math.abs(rounded) < 0.005 ? 0 : rounded;
    return `${normalized > 0 ? "+" : ""}${normalized.toFixed(2)} pts`;
}

/**
 * Helper function for determining which colour to apply to a pts label in the breakdown.
 * @param {Number} value the number we are checking.
 * @returns a string that points to the css styling.
 */
function getSignClass(value) {
    const rounded = Math.round(Number(value) * 100) / 100;
    if (rounded > 0) return "positive";
    if (rounded < 0) return "negative";
    return "";
}

/**
 * Constructs a modal to display how the points were calculated when deciding where to rank an anime.
 * @param {Object} desirability contains the calculations performed to determine how likely a user is to enjoy this anime.
 * @param {string} title the title of the anime that we are displaying the breakdown for.
 * @param {function} onClose callback to handle when the breakdown is closed.
 * @returns {JSX.Element} a graphical representation of how the points of an anime were earned.
 */
export default function AffinityBreakdown({ desirability = {}, title, onClose }) {
    const categories = useMemo(() => {
        const contributions = desirability.point_contributions || {};

        return Object.entries(CATEGORY_INFO)
            .map(([key, info]) => ({
                key,
                label: info.label,
                contribution: Number(contributions[key]) || 0,
                multiplier:
                    Number(desirability[info.multiplierKey]) || 1,
            }))
            .sort((a, b) => b.contribution - a.contribution);
    }, [desirability]);

    const affinityContribution = categories.reduce((sum, category) => sum + category.contribution, 0);
    const recommendationBonus = Number(desirability.recommendation_bonus) || 0;
    const totalScore = Number(desirability.total_score) || 0;

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="modal-close" onClick={onClose}>×</button>

                {/* Header */}
                <header className="breakdown-header">
                    <h2 id="breakdown-title" className="breakdown-title">
                        Scoring Breakdown
                    </h2>
                    <p className="breakdown-subtitle">
                        {title}
                    </p>
                </header>

                {/* Calculated Score */}
                <section className="breakdown-total">
                    <span className="breakdown-total-label">
                        Final Score
                    </span>
                    <span className="breakdown-total-value">
                        {totalScore.toFixed(2)}
                        <span style={{ fontSize: "0.85rem" }}>
                            {" "}pts
                        </span>
                    </span>
                </section>

                {/* Breakdown points awarded by each component */}
                <section className="breakdown-section">
                    <h3 className="breakdown-section-title">
                        Score Components
                    </h3>

                    <div className="breakdown-rows">
                        <div className="breakdown-row">
                            <span className="breakdown-row-label">
                                Base Score
                            </span>
                            <span className="breakdown-row-value">
                                {Number(desirability.base_score).toFixed(2)} pts
                            </span>
                        </div>

                        <div className="breakdown-row">
                            <span className="breakdown-row-label">
                                Affinity Contributions
                            </span>
                            <span className={`breakdown-row-value ${getSignClass(affinityContribution)}`}>
                                {formatPoints(affinityContribution)}
                            </span>
                        </div>

                        <div className="breakdown-row">
                            <span className="breakdown-row-label">
                                AniList Recommendation Bonus
                            </span>
                            <span className={`breakdown-row-value ${getSignClass(recommendationBonus)}`}>
                                {formatPoints(recommendationBonus)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Deeper look into affinity scores */}
                <section className="breakdown-section">
                    <h3 className="breakdown-section-title">
                        Affinity Contributions
                    </h3>

                    <p className="breakdown-section-description">
                        Expand a category to see its three biggest contributors.
                    </p>

                    <div className="affinity-list">
                        {categories.map((category) => {
                            const contributors = desirability.details?.[category.key] || [];
                            const supportsTopAnime = category.key === "directors" || category.key === "studios";
                            const singularCategoryName = category.key === "directors" ? "director" : "studio";

                            return (
                                <details className="affinity-dropdown" key={category.key}>
                                    <summary className="affinity-dropdown-header">
                                        <span className="affinity-name">
                                            {category.label}
                                        </span>

                                        <span className="affinity-dropdown-right">
                                            <span className={`affinity-points ${getSignClass(category.contribution)}`}>
                                                {formatPoints(category.contribution)}
                                            </span>

                                            <span className="affinity-dropdown-arrow">▾</span>
                                        </span>
                                    </summary>

                                    <div className="affinity-dropdown-content">
                                    {contributors.length > 0 ? (
                                        contributors.map((contributor, index) => {
                                            const hasTopAnime = contributor.top_anime?.length > 0;

                                            return (
                                                <div className="affinity-contributor" key={`${category.key}-${contributor.name}-${index}`}>
                                                    <div className="affinity-contributor-header">
                                                        <span className="affinity-contributor-name">
                                                            <span className="affinity-contributor-rank">{index + 1}.</span>
                                                            {contributor.name}
                                                        </span>

                                                        <span className={`affinity-points ${getSignClass(contributor.points_contributed)}`}>
                                                            {formatPoints(contributor.points_contributed)}
                                                        </span>
                                                    </div>

                                                    {supportsTopAnime && (
                                                        hasTopAnime ? (
                                                            <div className="affinity-anime-list">
                                                                {contributor.top_anime.map((anime, anime_index) => (
                                                                    <div className="affinity-anime-entry" key={anime.anilist_id}>
                                                                        <span className="affinity-anime-rank">
                                                                        {index + 1}.{anime_index + 1}
                                                                        </span>

                                                                        <span className="affinity-anime-details">
                                                                            <span className="affinity-anime-title">
                                                                                {anime.title.romaji}
                                                                            </span>
                                                                            <span className="affinity-anime-score">
                                                                                User Score: {anime.user_score}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="affinity-anime-empty">
                                                                <span className="affinity-anime-note">
                                                                    This would be your first anime by this {singularCategoryName}!
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="affinity-no-contributors">
                                            No individual contributors available.
                                        </p>
                                    )}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}