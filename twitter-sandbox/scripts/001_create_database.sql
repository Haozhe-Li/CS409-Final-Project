-- Create profiles table to store user information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    author_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR
SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT
WITH
    CHECK (auth.uid () = id);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE USING (auth.uid () = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR
SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON public.posts FOR
INSERT
WITH
    CHECK (auth.uid () = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts FOR
UPDATE USING (auth.uid () = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid () = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR
SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.likes FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid () = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user' || substring(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'bio', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();