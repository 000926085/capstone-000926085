-- First, junction tables.
DROP TABLE IF EXISTS user_genres_affinity;
DROP TABLE IF EXISTS user_tags_affinity;
DROP TABLE IF EXISTS user_studios_affinity;
DROP TABLE IF EXISTS anime_genres;
DROP TABLE IF EXISTS anime_tags;
DROP TABLE IF EXISTS anime_studios;
DROP TABLE IF EXISTS users_anime;

-- Next, lookup tables.
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS studios;
DROP TABLE IF EXISTS accounts;

-- Lastly, main tables.
DROP TABLE IF EXISTS anime;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  pfp TEXT
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.users FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE anime (
    anime_id BIGSERIAL PRIMARY KEY,
    anilist_id INTEGER UNIQUE NOT NULL,
    title JSONB,
    format VARCHAR,
    episodes INTEGER,
    status TEXT,
    start_date DATE,
    end_date DATE,
    mean_score INTEGER,
    popularity INTEGER,
    source TEXT
);

ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.anime FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.anime FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE users_anime (
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES public.anime(anime_id) ON DELETE CASCADE,
    list_status TEXT,
    score FLOAT,
    PRIMARY KEY (user_id, anime_id)
);

ALTER TABLE public.users_anime ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.users_anime FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.users_anime FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE genres (
    genre_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE
);

ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.genres FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.genres FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE anime_genres (
    genre_id INTEGER REFERENCES public.genres(genre_id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES public.anime(anime_id) ON DELETE CASCADE,
    PRIMARY KEY (genre_id, anime_id)
);

ALTER TABLE public.anime_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.anime_genres FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.anime_genres FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE user_genres_affinity (
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES public.genres(genre_id) ON DELETE CASCADE,
    affinity JSONB,
    PRIMARY KEY (user_id, genre_id)
);

ALTER TABLE public.user_genres_affinity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.user_genres_affinity FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.user_genres_affinity FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE tags (
    tag_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.tags FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE anime_tags (
    tag_id INTEGER REFERENCES public.tags(tag_id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES public.anime(anime_id) ON DELETE CASCADE,
    similarity INTEGER NOT NULL,
    PRIMARY KEY (tag_id, anime_id)
);

ALTER TABLE public.anime_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.anime_tags FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.anime_tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE user_tags_affinity (
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.tags(tag_id) ON DELETE CASCADE,
    affinity JSONB,
    PRIMARY KEY (user_id, tag_id)
);

ALTER TABLE public.user_tags_affinity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.user_tags_affinity FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.user_tags_affinity FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE studios (
    studio_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    anilist_id INTEGER UNIQUE,
    name TEXT
);

ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.studios FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.studios FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE anime_studios (
    studio_id INTEGER REFERENCES public.studios(studio_id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES public.anime(anime_id) ON DELETE CASCADE,
    PRIMARY KEY (studio_id, anime_id)
);

ALTER TABLE public.anime_studios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.anime_studios FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.anime_studios FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE user_studios_affinity (
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    studio_id INTEGER REFERENCES public.studios(studio_id) ON DELETE CASCADE,
    affinity JSONB,
    PRIMARY KEY (user_id, studio_id)
);

ALTER TABLE public.user_studios_affinity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.user_studios_affinity FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.user_studios_affinity FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE roles (
    role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT INTO roles (name)
VALUES ('Director'), ('Admin');

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.roles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.roles FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE accounts (
    account_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id INTEGER REFERENCES public.roles(role_id) ON DELETE CASCADE,
    username TEXT,
    password TEXT,
    blurb TEXT,
    contact TEXT,
    pfp TEXT,
    created_on DATE DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" 
ON public.accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" 
ON public.accounts FOR INSERT TO authenticated WITH CHECK (true);