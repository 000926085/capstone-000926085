import "./AffinityRing.modules.css"
import { getScoreColour } from '../../utils/getScoreColour';

/**
 * Maps the multiplier value from 0.5 to 1.5 into 0 to 100.
 * @param {float} mult the multiplier of a given category. 
 * @returns the multiplier confined to a number between 0 to 100.
 */
function mapMultiplier(mult) {
    const clamped = Math.max(0.5, Math.min(1.5, mult));
    return ((clamped - 0.5) / (1.5 - 0.5)) * 100;
}

export default function AffinityRing({label, points, multiplier, color="#39ef38", size = 100, strokeWidth = 9}) {
    const normalizedStrength = mapMultiplier(multiplier);
    const formattedPoints = `${points > 0 ? "+" : ""}${points.toFixed(1)}`;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - normalizedStrength / 100);

    const pointsClass =
        points > 0
            ? "affinity-ring__points--positive"
            : points < 0
                ? "affinity-ring__points--negative"
                : "affinity-ring__points--neutral";

    return (
        <div className="affinity-ring">
            <div className="affinity-ring__visual" style={{ width: size, height: size }}>
                <svg
                    className="affinity-ring__svg"
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    role="img"
                    aria-label={`${label}: ${normalizedStrength.toFixed(0)} out of 100`}
                >
                    <circle
                        className="affinity-ring__track"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                    />

                    <circle
                        className="affinity-ring__progress"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={getScoreColour(normalizedStrength)}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />

                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="affinity-ring__value"
                    >
                        {Math.round(normalizedStrength)}
                    </text>
                </svg>
            </div>

            <span className="affinity-ring__label">{label}</span>

            <span className={`affinity-ring__points ${pointsClass}`}>
                {formattedPoints} pts
            </span>
        </div>
    );
}
