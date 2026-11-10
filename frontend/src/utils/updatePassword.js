import { API_URL } from '../constants/anime';

export async function updatePassword(username, password) {
    const response = await fetch(`${API_URL}/api/update-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update password');
    }

    return response.json();
}