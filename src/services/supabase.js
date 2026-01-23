import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Some features may not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const authService = {
  signUp: async (email, password, username) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    if (!supabase) return { data: { session: null } };
    
    return await supabase.auth.getSession();
  },

  getUser: async () => {
    if (!supabase) return { data: { user: null } };
    
    return await supabase.auth.getUser();
  },

  onAuthStateChange: (callback) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const likesService = {
  getLikes: async (mediaId, mediaType) => {
    if (!supabase) return { count: 0 };
    
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);
    
    return { count: count || 0 };
  },

  isLiked: async (userId, mediaId, mediaType) => {
    if (!supabase || !userId) return false;
    
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .single();
    
    return !!data;
  },

  toggleLike: async (userId, mediaId, mediaType) => {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    
    const isLiked = await likesService.isLiked(userId, mediaId, mediaType);
    
    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      return { liked: false, error };
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: userId, media_id: mediaId, media_type: mediaType });
      
      return { liked: true, error };
    }
  }
};

export const bookmarksService = {
  getBookmarks: async (userId) => {
    if (!supabase || !userId) return { data: [] };
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  },

  isBookmarked: async (userId, mediaId, mediaType) => {
    if (!supabase || !userId) return false;
    
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .single();
    
    return !!data;
  },

  toggleBookmark: async (userId, mediaId, mediaType, title, posterPath) => {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    
    const isBookmarked = await bookmarksService.isBookmarked(userId, mediaId, mediaType);
    
    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      return { bookmarked: false, error };
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ 
          user_id: userId, 
          media_id: mediaId, 
          media_type: mediaType,
          title,
          poster_path: posterPath
        });
      
      return { bookmarked: true, error };
    }
  }
};

export const watchHistoryService = {
  addToHistory: async (userId, mediaId, mediaType, title, posterPath) => {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    
    const { error } = await supabase
      .from('watch_history')
      .upsert({ 
        user_id: userId, 
        media_id: mediaId, 
        media_type: mediaType,
        title,
        poster_path: posterPath,
        watched_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,media_id,media_type' 
      });
    
    return { error };
  },

  getHistory: async (userId, limit = 20) => {
    if (!supabase || !userId) return { data: [] };
    
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(limit);
    
    return { data: data || [], error };
  }
};

// Shorts yorumları servisi
export const commentsService = {
  getComments: async (mediaId, mediaType, limit = 50) => {
    if (!supabase) return { data: [], count: 0 };
    
    const { data, error, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data: data || [], count: count || 0, error };
  },

  addComment: async (userId, mediaId, mediaType, content, userInfo) => {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        media_id: mediaId,
        media_type: mediaType,
        content,
        user_name: userInfo?.name || 'Anonim',
        user_avatar: userInfo?.avatar || null
      })
      .select()
      .single();
    
    return { data, error };
  },

  deleteComment: async (userId, commentId) => {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    
    return { error };
  },

  getCommentCount: async (mediaId, mediaType) => {
    if (!supabase) return 0;
    
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);
    
    return count || 0;
  }
};

export default supabase;
