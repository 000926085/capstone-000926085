/**
 * 
 * @param {*} animeList a user's anime list.
 * @param {*} selectedStatuses the list statuses selected.
 * @param {*} searchQuery search term provided in the searchbar.
 * @returns 
 */
export function filterAnime(animeList = [], selectedStatuses = [], searchQuery = '') {
    const query = searchQuery.toLowerCase().trim();

    return animeList.filter((anime) => {
        const matchesStatus = selectedStatuses.some(
            (s) => s.status === anime.list_status && s.checked
        );

        const titleText = anime.title?.romaji || anime.title?.english || "";
        const matchesSearch = query === "" || titleText.toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
    });
}