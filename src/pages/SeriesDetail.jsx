import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaPlay, FaStar, FaHeart, FaShare, FaCalendar, FaTv, 
  FaUsers, FaTags, FaClock, FaGlobe, FaNetworkWired, FaImdb, FaChevronDown 
} from 'react-icons/fa';
import { tvService, mediaService, getImageUrl } from '../services/tmdb';
import { 
  formatDate, formatRating, getLanguageName, getYear, 
  favorites, watchHistory, truncateText
} from '../utils/helpers';
import Loading from '../components/UI/Loading';
import MovieCard from '../components/UI/MovieCard';
import PersonCard from '../components/UI/PersonCard';
import ImageGallery from '../components/UI/ImageGallery';
import VideoGallery from '../components/UI/VideoGallery';
import Reviews from '../components/UI/Reviews';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    loadSeriesData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'media') {
      loadMediaContent();
    }
  }, [activeTab]);

  const loadMediaContent = async () => {
    try {
      setMediaLoading(true);
      const media = await mediaService.getTvMedia(id);
      setMediaContent(media);
    } catch (error) {
      console.error('Media loading error:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const loadSeriesData = async () => {
    try {
      setLoading(true);
      const response = await tvService.getDetail(id);
      setSeries(response.data);
      setIsFavorite(favorites.isFavorite(response.data.id, 'tv'));
      
      watchHistory.add({
        id: response.data.id,
        name: response.data.name,
        poster_path: response.data.poster_path,
        vote_average: response.data.vote_average,
        media_type: 'tv'
      });
    } catch (error) {
      console.error('Series detail error:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      favorites.remove(series.id, 'tv');
    } else {
      favorites.add({
        id: series.id,
        name: series.name,
        poster_path: series.poster_path,
        vote_average: series.vote_average,
        first_air_date: series.first_air_date,
        media_type: 'tv'
      });
    }
    setIsFavorite(!isFavorite);
  };

  if (loading) return <Loading />;
  if (!series) return null;

  const creator = series.created_by?.[0];
  const trailer = series.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  return (
    <>
      <Helmet>
        <title>{series.name} - SINEFIX</title>
        <meta name="description" content={series.overview} />
      </Helmet>

      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-end">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(series.backdrop_path, 'original')}
            alt={series.name}
            className="w-full h-full object-cover opacity-30 md:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full pb-8 pt-20 md:pt-32">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
              <div className="flex-shrink-0 w-40 md:w-64">
                <img
                  src={getImageUrl(series.poster_path, 'w342')}
                  alt={series.name}
                  className="w-full rounded-xl shadow-2xl border border-white/5"
                />
              </div>

              <div className="flex-grow">
                <h1 className="text-3xl md:text-5xl font-bold mb-3">
                  {series.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-xs md:text-sm">
                  <span className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <strong>{formatRating(series.vote_average)}</strong>
                    <span className="text-gray-400 ml-1">({series.vote_count} oy)</span>
                  </span>
                  <span className="flex items-center">
                    <FaCalendar className="mr-1" />
                    {getYear(series.first_air_date)} - {series.in_production ? 'Devam ediyor' : getYear(series.last_air_date)}
                  </span>
                  <span className="flex items-center">
                    <FaTv className="mr-1" />
                    {series.number_of_seasons} Sezon / {series.number_of_episodes} Bölüm
                  </span>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                  {series.genres?.map(genre => (
                    <Link
                      key={genre.id}
                      to={`/genre/tv/${genre.id}`}
                      className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs hover:bg-white/10 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    to={`/watch/tv/${series.id}`}
                    className="btn-primary flex items-center space-x-2 px-8"
                  >
                    <FaPlay className="text-xs" />
                    <span className="text-sm font-bold tracking-widest uppercase">İlk Bölümü İzle</span>
                  </Link>
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-xl transition-colors ${
                      isFavorite 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 border border-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="border-b border-white/5 sticky top-16 bg-black/80 backdrop-blur-md z-20">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'GENEL BAKIŞ' },
              { id: 'seasons', label: 'SEZONLAR' },
              { id: 'cast', label: 'OYUNCULAR' },
              { id: 'media', label: 'MEDYA' },
              { id: 'details', label: 'DETAYLAR' },
              { id: 'reviews', label: 'YORUMLAR' },
              { id: 'similar', label: 'BENZERLER' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 whitespace-nowrap transition-all text-[10px] font-bold tracking-[0.2em] ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      <section className="container-custom py-8">
    {activeTab === 'overview' && (
      <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Özet</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              {series.overview || 'Özet bilgisi bulunmamaktadır.'}
            </p>

            {creator && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Yaratıcı</h3>
                <Link
                  to={`/person/${creator.id}`}
                  className="inline-flex items-center space-x-3 hover:text-gray-300"
                >
                  <img
                    src={getImageUrl(creator.profile_path, 'w185')}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span>{creator.name}</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'seasons' && <SeasonsList seasons={series.seasons} seriesId={series.id} />}

        {activeTab === 'cast' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Başrol Oyuncuları</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {series.aggregate_credits?.cast?.slice(0, 12).map(person => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-8">
            {mediaLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                {mediaContent?.videos?.length > 0 && <VideoGallery videos={mediaContent.videos} />}
                {mediaContent?.images && <ImageGallery images={mediaContent.images} title={series.name} />}
                {!mediaContent?.videos?.length && !mediaContent?.images?.backdrops?.length && (
                  <div className="text-center py-8 text-gray-400">
                    Bu dizi için medya içeriği bulunmamaktadır.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'details' && (
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Dizi Bilgileri</h3>
              <div><span className="text-gray-400">Orijinal Başlık:</span><p className="font-medium">{series.original_name}</p></div>
              <div><span className="text-gray-400">Durum:</span><p className="font-medium">{series.status}</p></div>
              <div><span className="text-gray-400">Türü:</span><p className="font-medium">{series.type}</p></div>
              <div><span className="text-gray-400">Orijinal Dil:</span><p className="font-medium">{getLanguageName(series.original_language)}</p></div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Yayın Bilgileri</h3>
              {series.networks?.length > 0 && (
                <div>
                  <span className="text-gray-400">Kanal:</span>
                  <div className="mt-2 flex items-center space-x-2">
                    {series.networks[0].logo_path && <img src={getImageUrl(series.networks[0].logo_path, 'w92')} alt={series.networks[0].name} className="h-8 object-contain" />}
                    <span>{series.networks[0].name}</span>
                  </div>
                </div>
              )}
            </div>
           </div>
        )}

        {activeTab === 'reviews' && <Reviews reviews={series.reviews?.results || []} />}

        {activeTab === 'similar' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Benzer Diziler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {series.similar?.results?.slice(0, 12).map(item => (
                <MovieCard key={item.id} item={item} mediaType="tv" />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

const SeasonsList = ({ seasons, seriesId }) => {
  const [expandedSeason, setExpandedSeason] = useState(null);
  
  const toggleSeason = (seasonNumber) => {
    setExpandedSeason(prev => prev === seasonNumber ? null : seasonNumber);
  }
  
  return (
    <div className="space-y-4 max-w-4xl">
      {seasons.map(season => (
        <div key={season.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
          <div 
            className="flex items-center p-4 cursor-pointer hover:bg-white/10 transition-colors gap-5" 
            onClick={() => toggleSeason(season.season_number)}
          >
            <div className="flex-shrink-0 w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-xl">
              <img src={getImageUrl(season.poster_path, 'w185')} alt={season.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight italic">{season.name}</h3>
              <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                <span>{getYear(season.air_date) || 'YAKINDA'}</span>
                <span>{season.episode_count} BÖLÜM</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2 hidden sm:block italic font-light">{season.overview || 'Bu sezon için henüz bir özet girilmemiş.'}</p>
            </div>
            <div className={`transition-transform duration-300 ${expandedSeason === season.season_number ? 'rotate-180' : ''}`}>
              <FaChevronDown className="text-gray-600" />
            </div>
          </div>

          {expandedSeason === season.season_number && (
            <div className="px-6 py-6 border-t border-white/5 bg-black/40 animate-fade-in">
              <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed block sm:hidden italic">
                {season.overview || 'Bu sezon için henüz bir özet girilmemiş.'}
              </p>
              <Link 
                to={`/watch/tv/${seriesId}?season=${season.season_number}`} 
                className="btn-primary inline-flex items-center space-x-3 px-8"
              >
                <FaPlay className="text-[10px]" />
                <span className="text-xs font-black tracking-[0.2em] uppercase">SEZONU İZLE</span>
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SeriesDetail;
