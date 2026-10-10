/**
 * Determines the colour of the mean score on the anime card along a range. 
 * @param {Number} score the mean score of an anime.
 * @returns the colour of a mean score that this AnimeCard will be provided with.
 */
export function getScoreColour(score) {
    if (score === undefined || score === null) return '#64748b';
    const MIN_SCORE = 50;
    const MAX_SCORE = 90;

    const clampedScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
    const hue = ((clampedScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 120;
    return `hsl(${hue}, 85%, 40%)`;
}