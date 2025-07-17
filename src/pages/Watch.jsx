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

  // Close dropdown when clicking outside
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
        // Sadece vidsrc ve vidfast sağlayıcıları
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

  // Get quality label for provider
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

  // Get text for selected provider button
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
        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-900 pt-16">
          <div className="container-custom py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Link
                  to={type === 'movie' ? `/movie/${id}` : `/tv/${id}`}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaArrowLeft />
                </Link>
                <div>
                  <h1 className="text-xl font-bold">{title}</h1>
                  {type === 'tv' && seasonData && (
                    <p className="text-sm text-gray-400">
                      Sezon {selectedSeason} - Bölüm {selectedEpisode}: 
                      {seasonData.episodes?.[selectedEpisode - 1]?.name}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Provider Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg"
                >
                  {getSelectedProviderText()}
                  <FaChevronDown className={`ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 max-h-96 overflow-y-auto bg-gray-900 rounded-lg shadow-lg z-50 border border-gray-800 py-1">
                    {playerUrls.map((provider, index) => {
                      // Custom styles based on provider type
                      const getItemStyles = () => {
                        // Selected item
                        if (selectedProvider === index) {
                          return "bg-gray-700";
                        }
                        // Default
                        return "hover:bg-gray-800";
                      };
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedProvider(index);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-2 text-left ${getItemStyles()} text-white transition-colors`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <span>{provider.name}</span>
                            </div>
                            
                            {provider.quality && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-800/60 rounded">
                                {provider.quality}
                              </span>
                            )}
                          </div>
                          
                          {selectedProvider === index && (
                            <div className="ml-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          )}
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
            {/* Player Section */}
            <div className="lg:col-span-3">
              {/* Player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4 group">
                {/* Backdrop Image with Play Button */}
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

                {/* Video Player */}
                {currentUrl && (
                  <iframe
                    src={currentUrl}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}

                {/* Loading State */}
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

              {/* Episode Description for TV Shows */}
              {type === 'tv' && seasonData?.episodes?.[selectedEpisode - 1] && (
                <div className="bg-gray-900 rounded-lg p-6 mb-4">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-32 h-20 bg-gray-800 rounded-lg overflow-hidden">
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
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">
                        S{selectedSeason}E{selectedEpisode}: {seasonData.episodes[selectedEpisode - 1].name}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        {seasonData.episodes[selectedEpisode - 1].air_date && (
                          <span>📅 {new Date(seasonData.episodes[selectedEpisode - 1].air_date).toLocaleDateString('tr-TR')}</span>
                        )}
                        {seasonData.episodes[selectedEpisode - 1].runtime && (
                          <span>⏱️ {seasonData.episodes[selectedEpisode - 1].runtime} dk</span>
                        )}
                        {seasonData.episodes[selectedEpisode - 1].vote_average > 0 && (
                          <span>⭐ {seasonData.episodes[selectedEpisode - 1].vote_average.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {seasonData.episodes[selectedEpisode - 1].overview || 'Bu bölüm için açıklama bulunmuyor.'}
                  </p>
                </div>
              )}

              {/* General Description */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                  {type === 'tv' ? 'Dizi Hakkında' : 'Film Hakkında'}
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {content.overview}
                </p>
                
                {/* Additional Info */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-sm text-gray-400">Tür</p>
                    <p className="text-white font-medium">
                      {content.genres?.map(g => g.name).join(', ') || 'Bilinmiyor'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Yıl</p>
                    <p className="text-white font-medium">
                      {new Date(content.release_date || content.first_air_date).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Puan</p>
                    <p className="text-white font-medium">
                      ⭐ {content.vote_average.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* TV Show Episodes */}
              {type === 'tv' && content.seasons && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <FaTv className="mr-2" />
                    Bölümler
                  </h3>

                  {/* Season Selector */}
                  <select
                    value={selectedSeason}
                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-gray-500"
                  >
                    {content.seasons
                      .filter(season => season.season_number > 0)
                      .map(season => (
                        <option key={season.season_number} value={season.season_number}>
                          Sezon {season.season_number}
                        </option>
                      ))}
                  </select>

                  {/* Episode List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {seasonData?.episodes?.map(episode => (
                      <button
                        key={episode.episode_number}
                        onClick={() => handleEpisodeChange(episode.episode_number)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedEpisode === episode.episode_number
                            ? 'bg-gray-800 border border-gray-600'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-20 h-12 bg-gray-800 rounded overflow-hidden">
                            {episode.still_path ? (
                              <img
                                src={getImageUrl(episode.still_path, 'w185')}
                                alt={episode.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaTv className="text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {episode.episode_number}. {episode.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {episode.runtime ? `${episode.runtime} dk` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Content */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center">
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
