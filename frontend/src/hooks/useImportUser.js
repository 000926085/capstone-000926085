import { useState } from 'react';

export function useImportUser() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const importUser = async (username, onSuccess) => {
    setErr(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErr("Please enter a username.");
      return false;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/import-anilist-user/${encodeURIComponent(trimmedUser)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setErr(errorData.detail || "An unexpected error occurred.");
        return false;
      }

      if (onSuccess) {
        onSuccess(trimmedUser);
      }
      return true;

    } catch (error) {
      setErr("Failed to connect to the server.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { importUser, loading, err, setErr };
}