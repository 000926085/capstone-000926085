import { useState } from 'react';

const STEPS = [
  { key: 'supabase_check', label: 'Checking database...' },
  { key: 'anilist_fetch', label: 'Fetching anime list from AniList...' },
  { key: 'parsing', label: 'Parsing entries...' },
  { key: 'calculating', label: 'Calculating affinities...' },
  { key: 'saving', label: 'Saving data to Supabase...' },
];

export function useImportUser() {
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [err, setErr] = useState(null);

  const importUser = async (username, onSuccess) => {
    setErr(null);
    setCurrentStepIndex(0);
    setShowModal(false);

    const trimmedUser = username.trim();
    if (!trimmedUser) { return false; }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/import-anilist-user/${encodeURIComponent(trimmedUser)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.body) throw new Error("Response body missing");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line);

          if (data.error) {
            setErr(data.error);
            setShowModal(true);
            return false;
          }

          if (data.step) {
            const index = STEPS.findIndex(s => s.key === data.step);
            if (index !== -1) {
              setCurrentStepIndex(index);

              // Only show the popup if we're doing import work.
              if (index > 0) {
                setShowModal(true);
              }
            }
          }
        }
      }

      if (onSuccess) onSuccess(trimmedUser);
      return true;

    } catch (error) {
      setErr("Failed to connect to the server.");
      setShowModal(true);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };

  return { importUser, loading, showModal, currentStepIndex, err, setErr, STEPS };
}