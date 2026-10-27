import React from 'react';
import styles from './ImportProgress.module.css';

export default function ImportProgress({ isOpen, currentStepIndex, steps, currentBatch, totalBatches, err }) {
  const isSavingBatch = totalBatches > 0 && currentBatch > 0;

  return (
    <div className={`${styles['modal-overlay']} ${isOpen ? styles.open : ''}`}>
      <div className={styles['modal-content']}>
        <h3 className={styles['modal-title']}>Importing AniList Data</h3>

        <div className={styles['modal-body']}>
          <div className={styles['steps-list']}>
            {steps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`${styles['step-item']} ${isCurrent ? styles.active : ''} ${isPast ? styles.completed : ''}`}
                >
                  <span className={styles['step-icon']}>
                    {isPast ? '✓' : isCurrent ? '▶ ' : '○ '}
                  </span>

                  <span className={isCurrent ? styles['bold-step'] : ''}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Batch progress */}
          {isSavingBatch && (
            <div className={styles['batch-progress']}>
              <p>Batch {currentBatch} of {totalBatches}</p>

              <div className={styles['batch-progress-track']}>
                <div
                  className={styles['batch-progress-fill']}
                  style={{
                    width: `${(currentBatch / totalBatches) * 100}%`
                  }}
                />
              </div>

              <p className={styles['batch-progress-percentage']}>
                {Math.round((currentBatch / totalBatches) * 100)}%
              </p>
            </div>
          )}
        </div>

        {err && <p className={styles['modal-error']}>{err}</p>}
      </div>
    </div>
  );
}