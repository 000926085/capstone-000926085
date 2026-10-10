import AffinityRing from "../AffinityRing/AffinityRing"
import "./AffinityBreakdown.modules.css"

export default function AffinityBreakdown({desirability}) {
    return (
        <div className="affinity-breakdown">
            <AffinityRing
                label="Genres"
                points={desirability.point_contributions.genres}
                multiplier={desirability.genre_multiplier}
            />

            <AffinityRing
                label="Tags"
                points={desirability.point_contributions.tags}
                multiplier={desirability.tag_multiplier}
            />

            <AffinityRing
                label="Studios"
                points={desirability.point_contributions.studios}
                multiplier={desirability.studio_multiplier}
            />

            <AffinityRing
                label="Directors"
                points={desirability.point_contributions.directors}
                multiplier={desirability.director_multiplier}
            />
        </div>
    );
}