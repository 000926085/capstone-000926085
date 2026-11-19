import { useFetchAniListDetails } from '../../hooks/useFetchAniListDetails';
import styles from './InformationPage.module.css';

export default function InformationPage({ anime_id, onClose }) {
    const { details, loading, error } = useFetchAniListDetails({ anime_id });

    const trailerUrl =
        details?.trailer?.site === "youtube" && details?.trailer?.id
            ? `https://www.youtube.com/embed/${details.trailer.id}`
            : null;

    return (
        <div className={`${styles['modal-overlay']} ${styles.open}`} onClick={onClose} data-testid="modal-overlay">
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                
                <button className={styles['close-btn']} onClick={onClose} aria-label="Close modal">
                    &times;
                </button>

                {loading && <div className={styles['status-message']}>Loading anime details...</div>}
                {error && <div className={styles.error}>{error}</div>}
                {!loading && !error && !details && (
                    <div className={styles['status-message']}>No anime details available.</div>
                )}

                {details && (
                    <>
                        {details.bannerImage && (
                            <div 
                                className={styles['banner-header']} 
                                style={{ backgroundImage: `url(${details.bannerImage})` }}
                            >
                                <div className={styles['banner-overlay']}>
                                    <div className={styles['badges']}>
                                        {details.season && <span className={styles.badge}>{details.season}</span>}
                                        {details.seasonYear && <span className={styles.badge}>{details.seasonYear}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles['modal-body']}>
                            <div className={styles['section']}>
                                <h3>Synopsis</h3>
                                <div 
                                    className={styles.description} 
                                    data-testid="description"
                                    dangerouslySetInnerHTML={{ __html: details.description }} 
                                />
                            </div>

                            <div className={styles['section']}>
                                <h3>Trailer</h3>
                                {loading ? (
                                    <p>Loading trailer...</p>
                                ) : trailerUrl ? (
                                    <div className={styles['trailer-container']}>
                                        <iframe
                                            src={trailerUrl}
                                            title="Anime Trailer"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                            data-testid="trailer-iframe"
                                        />
                                    </div>
                                ) : (
                                    <p className={styles['no-trailer']}>No trailer found.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}