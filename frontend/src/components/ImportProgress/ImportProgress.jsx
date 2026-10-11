import React from 'react';
import './ImportProgress.modules.css';

export default function ImportProgress({ isOpen, currentStepIndex, steps,  currentBatch, totalBatches, err }) {
  const isSavingBatch = totalBatches > 0 && currentBatch > 0;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <h3 className="modal-title">Importing AniList Data</h3>

        <div className="modal-body">
          <div className="steps-list">
            {steps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`step-item ${isCurrent ? 'active' : ''} ${isPast ? 'completed' : ''}`}
                >
                  <span className="step-icon">
                    {isPast ? '✓' : isCurrent ? '▶ ' : '○ '}
                  </span>

                  <span className={isCurrent ? 'bold-step' : ''}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Batch progress */}
          {isSavingBatch && (
            <div className="batch-progress">
              <p>Batch {currentBatch} of {totalBatches}</p>

              <div className="batch-progress-track">
                <div
                  className="batch-progress-fill"
                  style={{
                    width: `${(currentBatch / totalBatches) * 100}%`
                  }}
                />
              </div>

              <p className="batch-progress-percentage">
                {Math.round((currentBatch / totalBatches) * 100)}%
              </p>
            </div>
          )}
        </div>

        {err && <p className="modal-error">{err}</p>}
      </div>
    </div>
  );
}