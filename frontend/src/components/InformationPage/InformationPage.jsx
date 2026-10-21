import { useFetchAniListDetails } from '../../hooks/useFetchAniListDetails'
import { useEffect } from 'react';

import './InformationPage.modules.css'

export default function InformationPage({anime_id, onClose}) {
    const { details, loading, error } = useFetchAniListDetails({ anime_id });

     const trailerUrl =
        details?.trailer?.site === "youtube" && details?.trailer?.id
            ? `https://www.youtube.com/embed/${details.trailer.id}`
            : null;

    return (
        <div className="modal-overlay open" onClick={onClose}> 
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {loading && <p>Loading anime details...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && !details && (
                    <p>No anime details available.</p>
                )}

                {details && <p data-testid="description">{details.description}</p>}
                {loading ? (
                    <p>Loading trailer...</p>
                ) : trailerUrl ? (
                    <section>
                        <div className="trailer-container">
                            <iframe
                                src={trailerUrl}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </section>
                ) : (
                    <p>No trailer found.</p>
                )}
            </div>
        </div>
    )
}