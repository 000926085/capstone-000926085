import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../constants/anime';

const userCache = new Map();

/**
 * Responsible for fetching the planning data.
 * @param {string} username the username of the user we are fetching the planning data of. 
 * @returns an object containing the anime list, when it was last updated, loading state and, if applicable, an error message.
 */
export function useRecommendationsMultiple(usernames) {
    const [rawUserData, setRawUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Normalize input to be an array of Strings.
    const userList = useMemo(() => {
        if (!usernames) return [];
        return Array.isArray(usernames) ? usernames.filter(Boolean) : [usernames];
    }, [usernames]);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            if (userList.length === 0) {
                if (mounted) {
                    setRawUserData([]);
                    setLoading(false);
                }
            }

            setLoading(true);
            setError(false);

            try {
                const promises = userList.map(async (username) => {
                    if (userCache.has(username)) { return userCache.get(username); }

                    const res = await fetch(`${API_URL}/api/fetch-planning-data/${username}`);
                    if (!res.ok) throw new Error("User not found.");

                    const data = await res.json();
                    const userData = {
                        username: username,
                        planning: data.planning_anime || [],
                        excludedIds: data.excluded_anime_ids || [],
                        lastUpdated: data.last_updated || null,
                        pfp: data.pfp || null,
                    }

                    userCache.set(username, userData);
                    return userData;
                });

                const results = await Promise.all(promises);
                if (mounted) { setRawUserData(results); }
            } catch (err) {
                console.error(err);
                if (mounted) { setError(true); }
            } finally {
                if (mounted) { setLoading(false); }
            }
        };

        fetchData();

        return () => { mounted = false; };
    }, [userList.join(',')]);

    const processedData = useMemo(() => {
        if (rawUserData.length === 0) {
            return { anime: [], lastUpdated: null, pfp: null };
        }

        const primaryUser = rawUserData[0];
        const OVERLAP_BOOST = 0;
        const candidateMap = {};
        const allExcludedIds = new Set();

        // Find each unique anime and exclude any anime that're completed by at least one user.
        rawUserData.forEach((user) => {
            if (user.excludedIds) { user.excludedIds.forEach(id => allExcludedIds.add(id)); }

            user.planning.forEach((item) => {
                const animeId = item.anime_id;
                const score = item.desirability?.total_score || 0;

                if (!candidateMap[animeId]) {
                    candidateMap[animeId] = {
                        animeObj: item,
                        scores: []
                    };
                }
                candidateMap[animeId].scores.push(score);
            });
        });

        const blendedList = [];
        for (const [animeId, data] of Object.entries(candidateMap)) {
            if (allExcludedIds.has(Number(animeId))) { continue; } 

            const scores = data.scores;
            const overlapCount = scores.length;
            const avgScore = scores.reduce((sum, s) => sum + s, 0) / overlapCount;

            const bonusMultiplier = 1.0 + OVERLAP_BOOST * (overlapCount - 1);
            const finalScore = avgScore * bonusMultiplier;

            blendedList.push({
                ...data.animeObj,
                desirability: {
                    ...data.animeObj.desirability,
                    total_score: Number(finalScore.toFixed(4)),
                    base_avg_score: Number(avgScore.toFixed(4)),
                    overlap_count: overlapCount
                }
            });
        }

        const rankedAnime = blendedList
            .sort((a, b) => b.desirability.total_score - a.desirability.total_score)
            .map((anime, index) => ({ ...anime, rank: index + 1 }));

        return {
            anime: rankedAnime,
            lastUpdated: primaryUser.lastUpdated,
            pfp: primaryUser.pfp
        };
    }, [rawUserData]);

    return {
        anime: processedData.anime,
        lastUpdated: processedData.lastUpdated,
        pfp: 'https://s4.anilist.co/file/anilistcdn/user/avatar/large/b535745-ucaA3muNCFk9.jpg',
        loading,
        error
    };
}