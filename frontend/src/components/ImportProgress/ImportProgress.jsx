import React from 'react';
import './ImportProgress.modules.css';

export default function ImportProgress({ isOpen, currentStepIndex, steps, err }) {
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
        </div>

        {err && <p className="modal-error">{err}</p>}
      </div>
    </div>
  );
}