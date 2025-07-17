import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaBirthdayCake, FaMapMarkerAlt, FaImdb, FaInstagram, FaTwitter } from 'react-icons/fa';
import { personService, getImageUrl } from '../services/tmdb';
import { formatDate, getGenderText, getDepartmentText } from '../utils/helpers';
import MovieCard from '../components/UI/MovieCard';
import Loading from '../components/UI/Loading';

const Person = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('movies');

  useEffect(() => {
    loadPersonData();
  }, [id]);

  const loadPersonData = async () => {
    try {
      setLoading(true);
      const response = await personService.getDetail(id);
      setPerson(response.data);
    } catch (error) {
      console.error('Person detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!person) return null;

  const calculateAge = (birthday, deathday) => {
    if (!birthday) return null;
    const endDate = deathday ? new Date(deathday) : new Date();
    const birthDate = new Date(birthday);
    const age = Math.floor((endDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const age = calculateAge(person.birthday, person.deathday);

  // Filmografi
  const sortedCredits = {
    movies: person.movie_credits?.cast?.sort((a, b) => 
      new Date(b.release_date || 0) - new Date(a.release_date || 0)
    ) || [],
    tvShows: person.tv_credits?.cast?.sort((a, b) => 
      new Date(b.first_air_date || 0) - new Date(a.first_air_date || 0)
    ) || []
  };

  return (
    <>
      <Helmet>
        <title>{person.name} - SINEFIX</title>
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="md:col-span-1">
              <div className="sticky top-24">
                {/* Profile Image */}
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 mb-6">
                  {person.profile_path ? (
                    <img
                      src={getImageUrl(person.profile_path, 'w500')}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUser className="text-gray-700 text-6xl" />
                    </div>
                  )}
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Kişisel Bilgiler</h2>
                  
                  {person.known_for_department && (
                    <div>
                      <p className="text-sm text-gray-400">Bilinen Mesleği</p>
                      <p className="font-medium">{getDepartmentText(person.known_for_department)}</p>
                    </div>
                  )}

                  {person.gender !== 0 && (
                    <div>
                      <p className="text-sm text-gray-400">Cinsiyet</p>
                      <p className="font-medium">{getGenderText(person.gender)}</p>
                    </div>
                  )}

                  {person.birthday && (
                    <div>
                      <p className="text-sm text-gray-400 flex items-center">
                        <FaBirthdayCake className="mr-1" /> Doğum Tarihi
                      </p>
                      <p className="font-medium">
                        {formatDate(person.birthday)}
                        {age && !person.deathday && ` (${age} yaşında)`}
                      </p>
                    </div>
                  )}

                  {person.deathday && (
                    <div>
                      <p className="text-sm text-gray-400">Ölüm Tarihi</p>
                      <p className="font-medium">
                        {formatDate(person.deathday)}
                        {age && ` (${age} yaşında)`}
                      </p>
                    </div>
                  )}

                  {person.place_of_birth && (
                    <div>
                      <p className="text-sm text-gray-400 flex items-center">
                        <FaMapMarkerAlt className="mr-1" /> Doğum Yeri
                      </p>
                      <p className="font-medium">{person.place_of_birth}</p>
                    </div>
                  )}

                  {/* External Links */}
                  {person.external_ids && (
                    <div className="pt-4 space-y-2">
                      {person.external_ids.imdb_id && (
                        <a
                          href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400"
                        >
                          <FaImdb size={20} />
                          <span>IMDb</span>
                        </a>
                      )}
                      {person.external_ids.instagram_id && (
                        <a
                          href={`https://www.instagram.com/${person.external_ids.instagram_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-pink-500 hover:text-pink-400"
                        >
                          <FaInstagram size={20} />
                          <span>Instagram</span>
                        </a>
                      )}
                      {person.external_ids.twitter_id && (
                        <a
                          href={`https://twitter.com/${person.external_ids.twitter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                        >
                          <FaTwitter size={20} />
                          <span>Twitter</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="md:col-span-3">
              <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
              <p className="text-gray-400 mb-6">
                Bilinen Filmleri: {person.known_for?.map(item => item.title || item.name).join(', ')}
              </p>

              {/* Biography */}
              {person.biography && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Biyografi</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {person.biography}
                  </p>
                </div>
              )}

              {/* Filmography Tabs */}
              <div className="border-b border-gray-800 mb-6">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('movies')}
                    className={`pb-3 px-1 transition-colors ${
                      activeTab === 'movies'
                        ? 'text-white border-b-2 border-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Filmler ({sortedCredits.movies.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('tv')}
                    className={`pb-3 px-1 transition-colors ${
                      activeTab === 'tv'
                        ? 'text-white border-b-2 border-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Diziler ({sortedCredits.tvShows.length})
                  </button>
                </div>
              </div>

              {/* Filmography Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeTab === 'movies' ? (
                  sortedCredits.movies.map(credit => (
                    <MovieCard key={credit.id} item={credit} mediaType="movie" />
                  ))
                ) : (
                  sortedCredits.tvShows.map(credit => (
                    <MovieCard key={credit.id} item={credit} mediaType="tv" />
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Person;
