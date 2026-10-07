export const openAniListPage = (id) => {
    if (!id) return;
    window.open(`https://anilist.co/anime/${id}`, '_blank', 'noopener,noreferrer');
};

