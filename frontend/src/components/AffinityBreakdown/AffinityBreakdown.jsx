import { useMemo, useState } from "react";

import styles from './AffinityBreakdown.module.css';

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
        <div className={`${styles['modal-overlay']} ${styles.open}`} onClick={onClose}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                <button type="button" className={styles['modal-close']} onClick={onClose}>×</button>

                {/* Header */}
                <header className={styles['breakdown-header']}>
                    <h2 id="breakdown-title" className={styles['breakdown-title']}>
                        Scoring Breakdown
                    </h2>
                    <p className={styles['breakdown-subtitle']}>
                        {title}
                    </p>
                </header>

                {/* Calculated Score */}
                <section className={styles['breakdown-total']}>
                    <span className={styles['breakdown-total-label']}>
                        Final Score
                    </span>
                    <span className={styles['breakdown-total-value']}>
                        {totalScore.toFixed(2)}
                        <span style={{ fontSize: "0.85rem" }}>
                            {" "}pts
                        </span>
                    </span>
                </section>

                {/* Breakdown points awarded by each component */}
                <section className={styles['breakdown-section']}>
                    <h3 className={styles['breakdown-section-title']}>
                        Score Components
                    </h3>

                    <div className={styles['breakdown-rows']}>
                        <div className={styles['breakdown-row']}>
                            <span className={styles['breakdown-row-label']}>
                                Base Score
                            </span>
                            <span className={styles['breakdown-row-value']}>
                                {Number(desirability.base_score).toFixed(2)} pts
                            </span>
                        </div>

                        <div className={styles['breakdown-row']}>
                            <span className={styles['breakdown-row-label']}>
                                Affinity Contributions
                            </span>
                            <span className={`${styles['breakdown-row-value']} ${styles[getSignClass(affinityContribution)]}`}>
                                {formatPoints(affinityContribution)}
                            </span>
                        </div>

                        <div className={styles['breakdown-row']}>
                            <span className={styles['breakdown-row-label']}>
                                AniList Recommendation Bonus
                            </span>
                            <span className={`${styles['breakdown-row-value']} ${styles[getSignClass(recommendationBonus)]}`}>
                                {formatPoints(recommendationBonus)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Deeper look into affinity scores */}
                <section className={styles['breakdown-section']}>
                    <h3 className={styles['breakdown-section-title']}>
                        Affinity Contributions
                    </h3>

                    <p className={styles['breakdown-section-description']}>
                        Expand a category to see its three biggest contributors.
                    </p>

                    <div className={styles['affinity-list']}>
                        {categories.map((category) => {
                            const contributors = desirability.details?.[category.key] || [];
                            const supportsTopAnime = category.key === "directors" || category.key === "studios";
                            const singularCategoryName = category.key === "directors" ? "director" : "studio";

                            return (
                                <details className={styles['affinity-dropdown']} key={category.key}>
                                    <summary className={styles['affinity-dropdown-header']}>
                                        <span className={styles['affinity-name']}>
                                            {category.label}
                                        </span>

                                        <span className={styles['affinity-dropdown-right']}>
                                            <span className={`${styles['affinity-points']} ${styles[getSignClass(category.contribution)]}`}>
                                                {formatPoints(category.contribution)}
                                            </span>

                                            <span className={styles['affinity-dropdown-arrow']}>▾</span>
                                        </span>
                                    </summary>

                                    <div className={styles['affinity-dropdown-content']}>
                                    {contributors.length > 0 ? (
                                        contributors.map((contributor, index) => {
                                            const hasTopAnime = contributor.top_anime?.length > 0;

                                            return (
                                                <div className={styles['affinity-contributor']} key={`${category.key}-${contributor.name}-${index}`}>
                                                    <div className={styles['affinity-contributor-header']}>
                                                        <span className={styles['affinity-contributor-name']}>
                                                            <span className={styles['affinity-contributor-rank']}>{index + 1}.</span>
                                                            {contributor.name}
                                                        </span>

                                                        <span className={`${styles['affinity-points']} ${styles[getSignClass(contributor.points_contributed)]}`}>
                                                            {formatPoints(contributor.points_contributed)}
                                                        </span>
                                                    </div>

                                                    {supportsTopAnime && (
                                                        hasTopAnime ? (
                                                            <div className={styles['affinity-anime-list']}>
                                                                {contributor.top_anime.map((anime, anime_index) => (
                                                                    <div className={styles['affinity-anime-entry']} key={anime.anilist_id}>
                                                                        <span className={styles['affinity-anime-rank']}>
                                                                        {index + 1}.{anime_index + 1}
                                                                        </span>

                                                                        <span className={styles['affinity-anime-details']}>
                                                                            <span className={styles['affinity-anime-title']}>
                                                                                {anime.title.romaji}
                                                                            </span>
                                                                            <span className={styles['affinity-anime-score']}>
                                                                                User Score: {anime.user_score}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className={styles['affinity-anime-empty']}>
                                                                <span className={styles['affinity-anime-note']}>
                                                                    This would be your first anime by this {singularCategoryName}!
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className={styles['affinity-no-contributors']}>
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