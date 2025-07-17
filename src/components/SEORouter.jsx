import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, tvService, searchService } from '../services/tmdb';
import { createSlug } from '../utils/helpers';
import MovieDetail from '../pages/MovieDetail';
import SeriesDetail from '../pages/SeriesDetail';
import Watch from '../pages/Watch';
import Loading from './UI/Loading';

const SEORouter = ({ type = 'detail' }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      findContentBySlug(slug);
    }
  }, [slug]);

  const findContentBySlug = async (slug) => {
    try {
      setLoading(true);
      setError(null);

      // Slug'dan -izle kısmını çıkar
      const cleanSlug = slug.replace('-izle', '');
      
      // Önce popüler filmlerden ara
      const [moviesRes, tvRes] = await Promise.all([
        movieService.getPopular(),
        tvService.getPopular()
      ]);

      // Tüm içerikleri birleştir
      const allContent = [
        ...moviesRes.data.results.map(item => ({ ...item, media_type: 'movie' })),
        ...tvRes.data.results.map(item => ({ ...item, media_type: 'tv' }))
      ];

      // Slug ile eşleşen içeriği bul
      const foundContent = allContent.find(item => {
        const itemSlug = createSlug(item.title || item.name);
        return itemSlug === cleanSlug;
      });

      if (foundContent) {
        setContent(foundContent);
      } else {
        // Bulunamazsa arama yap
        const searchRes = await searchService.multi(cleanSlug.replace(/-/g, ' '));
        const searchResults = searchRes.data.results.filter(
          item => item.media_type === 'movie' || item.media_type === 'tv'
        );

        if (searchResults.length > 0) {
          const bestMatch = searchResults.find(item => {
            const itemSlug = createSlug(item.title || item.name);
            return itemSlug === cleanSlug;
          }) || searchResults[0];

          setContent(bestMatch);
        } else {
          setError('İçerik bulunamadı');
        }
      }
    } catch (err) {
      console.error('SEO Router error:', err);
      setError('İçerik yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen={true} text="İçerik yükleniyor..." />;
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-6">{error || 'İçerik bulunamadı'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // URL'yi doğru formata yönlendir
  const correctSlug = createSlug(content.title || content.name);
  const currentPath = window.location.pathname;
  
  if (type === 'watch') {
    const correctPath = `/${correctSlug}-izle`;
    if (currentPath !== correctPath) {
      navigate(correctPath, { replace: true });
      return null;
    }
    return <Watch contentData={content} />;
  } else {
    const correctPath = `/${correctSlug}`;
    if (currentPath !== correctPath) {
      navigate(correctPath, { replace: true });
      return null;
    }
    
    return content.media_type === 'movie' 
      ? <MovieDetail contentData={content} />
      : <SeriesDetail contentData={content} />;
  }
};

export default SEORouter;