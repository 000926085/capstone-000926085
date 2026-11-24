import { API_URL } from '../constants/anime';

export async function deleteUser(username) {
    const response = await fetch(`${API_URL}/api/delete-anilist-user/${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete user '${username}'.`);
    }

    return await response.json();
}