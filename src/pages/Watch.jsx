import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaExclamationTriangle, FaList, FaTv, FaChevronDown } from 'react-icons/fa';
import { movieService, tvService, getImageUrl } from '../services/tmdb';
import { playerService } from '../services/player';
import Loading from '../components/UI/Loading';

const Watch = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [playerUrls, setPlayerUrls] = useState([]);
  const [seasonData, setSeasonData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadContent();
  }, [type, id]);

  useEffect(() => {
    if (type === 'tv' && content) {
      loadSeasonData();
    }
  }, [selectedSeason, content]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      if (type === 'movie') {
        const response = await movieService.getDetail(id);
        setContent(response.data);
        
        const defaultProviders = ['vidsrc', 'vidfast'];
        const urls = playerService.getMovieUrl(id, defaultProviders);
        setPlayerUrls(urls);
      } else if (type === 'tv') {
        const response = await tvService.getDetail(id);
        setContent(response.data);
        const defaultProviders = ['vidsrc', 'vidfast'];
        updateTvPlayerUrls(response.data.id, 1, 1, defaultProviders);
      }
    } catch (error) {
      console.error('Content load error:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonData = async () => {
    if (!content) return;
    
    try {
      const response = await tvService.getSeasonDetail(content.id, selectedSeason);
      setSeasonData(response.data);
    } catch (error) {
      console.error('Season load error:', error);
    }
  };

  const updateTvPlayerUrls = (tvId, season, episode, providers = ['vidsrc', 'vidfast']) => {
    const urls = playerService.getTvUrl(tvId, season, episode, providers);
    setPlayerUrls(urls);
  };

  const handleEpisodeChange = (episode) => {
    setSelectedEpisode(episode);
    updateTvPlayerUrls(content.id, selectedSeason, episode);
    setSelectedProvider(0);
  };

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setSelectedEpisode(1);
    updateTvPlayerUrls(content.id, season, 1);
    setSelectedProvider(0);
  };

  if (loading) return <Loading />;
  if (!content || !playerUrls.length) return null;

  const title = content.title || content.name;
  const currentUrl = playerUrls[selectedProvider]?.url;

  const getQualityLabel = (provider) => {
    if (provider.quality) {
      return (
        <span className="ml-2 text-xs px-1.5 py-0.5 bg-black/20 rounded">
          {provider.quality}
        </span>
      );
    }
    return null;
  };

  const getSelectedProviderText = () => {
    if (!playerUrls.length) return 'Kaynak Seçin';
    
    const provider = playerUrls[selectedProvider];
    
    return (
      <>
        <span>{provider.name}</span>
        {getQualityLabel(provider)}
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>{title} İzle - SINEFIX</title>
      </Helmet>

      <div className="min-h-screen bg-black">
        <div className="bg-gray-950 border-b border-gray-900 pt-16">
          <div className="container-custom py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link
                  to={type === 'movie' ? `/movie/${id}` : `/tv/${id}`}
                  className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <FaArrowLeft className="text-sm" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold truncate leading-tight">{title}</h1>
                  {type === 'tv' && seasonData && (
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-0.5">
                      S{selectedSeason} E{selectedEpisode} • {seasonData.episodes?.[selectedEpisode - 1]?.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between sm:justify-start space-x-3 px-5 py-2.5 bg-[#050505] border border-white/5 hover:border-white/20 transition-all rounded-xl text-xs font-bold tracking-widest uppercase"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"/>
                    {getSelectedProviderText()}
                  </span>
                  <FaChevronDown className={`ml-2 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full sm:w-64 max-h-96 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-fade-in-up">
                    <div className="px-4 py-2 mb-1">
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Kaynak Seçenekleri</p>
                    </div>
                    {playerUrls.map((provider, index) => {
                      const isActive = selectedProvider === index;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedProvider(index);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-3.5 text-left transition-all ${isActive ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] font-bold uppercase tracking-widest">{provider.name}</span>
                            {provider.quality && (
                              <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 rounded-md uppercase tracking-tighter">
                                {provider.quality}
                              </span>
                            )}
                          </div>
                          {isActive && <div className="ml-3 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4 group">
                {!currentUrl && (
                  <div className="absolute inset-0">
                    <img
                      src={getImageUrl(content.backdrop_path, 'original')}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <button
                        onClick={() => setSelectedProvider(0)}
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {currentUrl && (
                  <iframe
                    src={currentUrl}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}

                {!currentUrl && !content.backdrop_path && (
                  <div className="flex items-center justify-center h-full bg-gray-800">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-gray-400">İçerik yükleniyor...</p>
                    </div>
                  </div>
                )}
              </div>

              {type === 'tv' && seasonData?.episodes?.[selectedEpisode - 1] && (
                <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 sm:p-8 mb-6">
                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-shrink-0 w-full md:w-56 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
                      {seasonData.episodes[selectedEpisode - 1].still_path ? (
                        <img
                          src={getImageUrl(seasonData.episodes[selectedEpisode - 1].still_path, 'w300')}
                          alt={seasonData.episodes[selectedEpisode - 1].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaTv className="text-gray-600 text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold mb-3 truncate italic uppercase tracking-tighter">
                        S{selectedSeason}E{selectedEpisode} • {seasonData.episodes[selectedEpisode - 1].name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {seasonData.episodes[selectedEpisode - 1].air_date && (
                          <span className="px-2 py-0.5 bg-white/5 rounded">📅 {new Date(seasonData.episodes[selectedEpisode - 1].air_date).getFullYear()}</span>
                        )}
                        {seasonData.episodes[selectedEpisode - 1].runtime && (
                          <span className="px-2 py-0.5 bg-white/5 rounded">⏱️ {seasonData.episodes[selectedEpisode - 1].runtime} DK</span>
                        )}
                        {seasonData.episodes[selectedEpisode - 1].vote_average > 0 && (
                          <span className="px-2 py-0.5 bg-white/5 rounded text-yellow-500">⭐ {seasonData.episodes[selectedEpisode - 1].vote_average.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed pt-8 border-t border-white/5 font-light">
                    {seasonData.episodes[selectedEpisode - 1].overview || 'Bu bölüm için detaylar henüz paylaşılmadı.'}
                  </p>
                </div>
              )}

              <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 sm:p-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">
                  {type === 'tv' ? 'DİZİ DETAYLARI' : 'FİLM DETAYLARI'}
                </h2>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base font-light">
                  {content.overview}
                </p>
                
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                  <div>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Kategori</p>
                    <p className="text-white text-xs font-bold truncate">
                      {content.genres?.[0]?.name || 'Genel'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Yıl</p>
                    <p className="text-white text-xs font-bold">
                      {new Date(content.release_date || content.first_air_date).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">IMDB</p>
                    <p className="text-white text-xs font-bold flex items-center gap-1">
                      ⭐ {content.vote_average.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {type === 'tv' && content.seasons && (
                <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 sm:p-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center">
                    <FaTv className="mr-3" />
                    BÖLÜM LİSTESİ
                  </h3>

                  <div className="mb-6">
                    <select
                      value={selectedSeason}
                      onChange={(e) => handleSeasonChange(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-3 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                    >
                      {content.seasons
                        .filter(season => season.season_number > 0)
                        .map(season => (
                          <option key={season.season_number} value={season.season_number}>
                            SEZON {season.season_number}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-3 max-h-[50vh] sm:max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {seasonData?.episodes?.map(episode => (
                      <button
                        key={episode.episode_number}
                        onClick={() => handleEpisodeChange(episode.episode_number)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                          selectedEpisode === episode.episode_number
                            ? 'bg-white text-black scale-[0.98]'
                            : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border ${selectedEpisode === episode.episode_number ? 'border-black/20' : 'border-white/5'}`}>
                            {episode.still_path ? (
                              <img
                                src={getImageUrl(episode.still_path, 'w185')}
                                alt={episode.name}
                                className={`w-full h-full object-cover ${selectedEpisode === episode.episode_number ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-black/40">
                                <FaTv className="text-xs" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-tight truncate">
                              {episode.episode_number}. {episode.name}
                            </p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${selectedEpisode === episode.episode_number ? 'text-black/50' : 'text-gray-600'}`}>
                              {episode.runtime ? `${episode.runtime} DK` : 'BELİRSİZ'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded p-4">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center">
                  <FaList className="mr-2" />
                  Benzer İçerikler
                </h3>
                <div className="space-y-3">
                  {(content.similar?.results || content.recommendations?.results)
                    ?.slice(0, 5)
                    .map(item => (
                      <Link
                        key={item.id}
                        to={`/watch/${item.media_type || type}/${item.id}`}
                        className="flex items-start space-x-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
                      >
                        <img
                          src={getImageUrl(item.poster_path, 'w92')}
                          alt={item.title || item.name}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {item.title || item.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.release_date || item.first_air_date).getFullYear()}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Watch;
