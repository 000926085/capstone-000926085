import { useState } from 'react';
import styles from './StatisticsModal.module.css';

export default function StatisticsModal({ user, onClose }) {
    const [sortBy, setSortBy] = useState('score');

    if (!user) return null;

    const sortItems = (items) => {
        if (!items) return [];
        return [...items].sort((a, b) => {
            const valA = a.affinity?.[sortBy] ?? 0;
            const valB = b.affinity?.[sortBy] ?? 0;
            return valB - valA;
        });
    };

    const renderAffinityList = (items, nameKey, label) => {
        const sortedItems = sortItems(items);
        
        return (
            <div className={styles['section']}>
                <h4>{label}</h4>
                {sortedItems.length > 0 ? (
                    <ul>
                        {sortedItems.map((item, index) => {
                            const displayName = item[nameKey]?.name || `ID: ${item[Object.keys(item)[0]]}`;
                            const { mean, count, score } = item.affinity || {};
                            return (
                                <li key={index}>
                                    <strong>{displayName}</strong> — Score: {score ?? 'N/A'} 
                                    {count !== undefined && ` (Count: ${count})`}
                                    {mean !== undefined && ` (Mean: ${mean})`}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={styles['empty-text']}>No {label.toLowerCase()} data available.</p>
                )}
            </div>
        )
    };

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    Affinities for: {user.username}
                </div>
                
                {/* Scrollable area handling overflow */}
                <div className={styles['scrollable-body']}>
                    {renderAffinityList(user.user_genres_affinity, 'genres', 'Genres')}
                    {renderAffinityList(user.user_directors_affinity, 'directors', 'Directors')}
                    {renderAffinityList(user.user_studios_affinity, 'studios', 'Studios')}
                </div>

                {/* Footer layout with options on the left and close button on the right */}
                <div className={styles['modal-footer']}>
                    <div className={styles['sort-toolbar']}>
                        <span className={styles['sort-label']}>Sort by:</span>
                        <label className={styles['radio-label']}>
                            <input 
                                type="radio" 
                                name="sortOption" 
                                value="score" 
                                checked={sortBy === 'score'} 
                                onChange={(e) => setSortBy(e.target.value)} 
                            />
                            Score
                        </label>
                        <label className={styles['radio-label']}>
                            <input 
                                type="radio" 
                                name="sortOption" 
                                value="count" 
                                checked={sortBy === 'count'} 
                                onChange={(e) => setSortBy(e.target.value)} 
                            />
                            Count
                        </label>
                        <label className={styles['radio-label']}>
                            <input 
                                type="radio" 
                                name="sortOption" 
                                value="mean" 
                                checked={sortBy === 'mean'} 
                                onChange={(e) => setSortBy(e.target.value)} 
                            />
                            Mean
                        </label>
                    </div>
                    <button className={styles['close-btn']} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}