import { useState, useEffect, useMemo } from 'react';

import { useFetchAllAnime } from '../../hooks/useFetchAllAnime';

import styles from './AdminAnimeManagement.module.css';

export default function AdminAnimeManagement() {
    const { anime, loading, error } = useFetchAllAnime();
    const sortedAnime = [...(anime || [])].sort((a, b) => {
        const titleA = a.title?.romaji || a.title?.english || '';
        const titleB = b.title?.romaji || b.title?.english || '';
        return titleA.localeCompare(titleB);
    });

    if (loading) { return; }

    return (
        <div className={styles['container']}>
            {sortedAnime.length > 0 ? (
                <div className={styles['table-wrapper']}>
                    <table className={styles['anime-table']}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Modify</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAnime.map((a) => {
                                return (
                                    <tr key={a.anime_id}>
                                        <td className={styles['id-cell']} data-label="ID">{a.anime_id}</td>
                                        <td>{a.title.romaji || a.title.english}</td>
                                        <td className={styles['stats-link']} data-label="Details">
                                            <span>Details</span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : ( <p>No anime found.</p>
            )}
        </div>
    )
}