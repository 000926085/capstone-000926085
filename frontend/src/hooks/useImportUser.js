import { useState } from 'react';
import { API_URL } from '../constants/anime';

const STEPS = [
  { key: 'supabase_check', label: 'Checking database...' },
  { key: 'anilist_fetch', label: 'Fetching anime list from AniList...' },
  { key: 'parsing', label: 'Parsing entries...' },
  { key: 'calculating', label: 'Calculating affinities...' },
  { key: 'saving_batch', label: 'Saving anime batches...' },
  { key: 'saving_affinities', label: 'Saving category affinities...' },
];

export function useImportUser() {
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [err, setErr] = useState(null);

  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  const importUser = async (username, onSuccess) => {
    setErr(null);
    setCurrentStepIndex(0);
    setShowModal(false);
    setCurrentBatch(0);
    setTotalBatches(0);

    const trimmedUser = username.trim();
    if (!trimmedUser) return false;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/import-anilist-user/${encodeURIComponent(trimmedUser)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!res.ok) {
        throw new Error('Import request failed');
      }

      if (!res.body) {
        throw new Error('Response body missing');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processLine = (line) => {
        if (!line.trim()) return true;

        const data = JSON.parse(line);

        if (data.error) {
          setErr(data.error);
          setShowModal(true);
          return false;
        }

        if (data.step) {
          const index = STEPS.findIndex(
            (step) => step.key === data.step
          );

          if (index !== -1) {
            setCurrentStepIndex(index);

            if (index > 0) {
              setShowModal(true);
            }
          }
        }

        if (data.step === 'saving_batch') {
          setCurrentBatch(data.batch ?? 0);
          setTotalBatches(data.total_batches ?? 0);
        }

        if (data.step === 'complete') {
          setCurrentBatch((previous) =>
            totalBatches > 0 ? totalBatches : previous
          );
        }

        return true;
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!processLine(line)) {
            await reader.cancel();
            return false;
          }
        }
      }

      // Process a final line if the stream ends without a newline.
      buffer += decoder.decode();

      if (buffer.trim()) {
        if (!processLine(buffer)) return false;
      }

      if (onSuccess) onSuccess(trimmedUser);
      return true;

    } catch (error) {
      console.error('Import failed:', error);
      setErr('Failed to connect to the server.');
      setShowModal(true);
      return false;

    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };

  return {
    importUser,
    loading,
    showModal,
    currentStepIndex,
    err,
    setErr,
    STEPS,
    currentBatch,
    totalBatches,
  };
}