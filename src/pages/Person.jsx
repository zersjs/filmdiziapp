import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { FaUser, FaImdb, FaInstagram, FaTwitter } from 'react-icons/fa';
import { getImageUrl } from '../services/tmdb';
import { usePerson } from '../hooks';
import { personSeo } from '../lib/seo';
import Seo, { getSiteUrl } from '../components/Seo';
import MovieCard from '../components/UI/MovieCard';
import MediaRow from '../components/UI/MediaRow';
import { DetailSkeleton } from '../components/UI/Loading';
import { EmptyState, ErrorState } from '../components/UI/States';
import { formatDate, getDepartmentText, getGenderText, getPersonPath, getReleaseDate } from '../utils/helpers';

const calculateAge = (birthday, deathday) => {
  if (!birthday) return null;
  const end = deathday ? new Date(deathday) : new Date();
  const birth = new Date(birthday);
  let age = end.getFullYear() - birth.getFullYear();
  const beforeBirthday = end.getMonth() < birth.getMonth() || (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

// Aynı yapımda birden fazla rol olabilir; tek kartta topla.
const mergeCredits = (credits = []) => {
  const map = new Map();
  credits.forEach(credit => {
    if (credit.media_type !== 'movie' && credit.media_type !== 'tv') return;
    const key = `${credit.media_type}-${credit.id}`;
    if (!map.has(key)) map.set(key, credit);
  });
  return [...map.values()];
};

const SORTS = [
  { id: 'date', label: 'En yeni' },
  { id: 'popular', label: 'En popüler' },
];

const PAGE_SIZE = 30;

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'movie', label: 'Filmler' },
  { id: 'tv', label: 'Diziler' },
];

const PersonPage = ({ id, slug }) => {
  const { data: person, isLoading, isError, error, refetch } = usePerson(id);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const credits = useMemo(() => {
    if (!person) return [];
    const acting = person.known_for_department === 'Acting';
    const source = acting ? person.combined_credits?.cast : [...(person.combined_credits?.crew || []), ...(person.combined_credits?.cast || [])];
    return mergeCredits(source);
  }, [person]);

  const knownFor = useMemo(
    () => [...credits].filter(c => c.poster_path).sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 12),
    [credits]
  );

  const visibleCredits = useMemo(() => {
    const filtered = credits.filter(c => filter === 'all' || c.media_type === filter);
    return filtered.sort((a, b) => {
      if (sort === 'popular') return (b.vote_count || 0) - (a.vote_count || 0);
      return (getReleaseDate(b) || '0000').localeCompare(getReleaseDate(a) || '0000');
    });
  }, [credits, filter, sort]);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !person) {
    return (
      <div className="container-custom py-10">
        {error?.response?.status === 404 ? (
          <EmptyState icon={FaUser} title="Kişi bulunamadı">
            <Link to="/" className="btn btn-secondary">Ana sayfaya dön</Link>
          </EmptyState>
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    );
  }

  const path = getPersonPath(person);
  if (`/person/${id}${slug ? `/${slug}` : ''}` !== path) return <Navigate to={path} replace />;
  const seo = personSeo(person, getSiteUrl());
  const age = calculateAge(person.birthday, person.deathday);
  const ids = person.external_ids || {};
  const gender = getGenderText(person.gender);
  const counts = {
    all: credits.length,
    movie: credits.filter(c => c.media_type === 'movie').length,
    tv: credits.filter(c => c.media_type === 'tv').length,
  };
  const bioLong = (person.biography || '').length > 600;

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        path={seo.path}
        image={seo.image}
        imageAlt={seo.imageAlt}
        type={seo.ogType}
        jsonLd={seo.jsonLd}
      />

      <div className="page container-custom">
        <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          <aside className="flex gap-4 sm:block">
            <div className="aspect-[2/3] w-28 flex-shrink-0 overflow-hidden rounded-xl border border-white/5 bg-[#111] sm:w-full">
              {person.profile_path ? (
                <img src={getImageUrl(person.profile_path, 'h632')} alt={person.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-white/15"><FaUser /></div>
              )}
            </div>

            <div className="min-w-0 sm:mt-6">
              <h1 className="page-title sm:hidden">{person.name}</h1>
              <dl className="mt-3 space-y-3 text-sm sm:mt-0">
                {person.known_for_department && (
                  <div>
                    <dt className="text-xs text-white/40">Bilinen işi</dt>
                    <dd className="font-semibold text-white/80">{getDepartmentText(person.known_for_department)}</dd>
                  </div>
                )}
                {person.birthday && (
                  <div>
                    <dt className="text-xs text-white/40">Doğum tarihi</dt>
                    <dd className="font-semibold text-white/80">
                      {formatDate(person.birthday)}{age !== null && !person.deathday && ` (${age})`}
                    </dd>
                  </div>
                )}
                {person.deathday && (
                  <div>
                    <dt className="text-xs text-white/40">Ölüm tarihi</dt>
                    <dd className="font-semibold text-white/80">{formatDate(person.deathday)}{age !== null && ` (${age})`}</dd>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="hidden sm:block">
                    <dt className="text-xs text-white/40">Doğum yeri</dt>
                    <dd className="font-semibold text-white/80">{person.place_of_birth}</dd>
                  </div>
                )}
                {gender && (
                  <div className="hidden sm:block">
                    <dt className="text-xs text-white/40">Cinsiyet</dt>
                    <dd className="font-semibold text-white/80">{gender}</dd>
                  </div>
                )}
              </dl>
              {(ids.imdb_id || ids.instagram_id || ids.twitter_id) && (
                <div className="mt-4 flex gap-1">
                  {ids.imdb_id && (
                    <a href={`https://www.imdb.com/name/${ids.imdb_id}`} target="_blank" rel="noopener noreferrer" className="icon-btn bordered" aria-label="IMDb">
                      <FaImdb />
                    </a>
                  )}
                  {ids.instagram_id && (
                    <a href={`https://www.instagram.com/${ids.instagram_id}`} target="_blank" rel="noopener noreferrer" className="icon-btn bordered" aria-label="Instagram">
                      <FaInstagram />
                    </a>
                  )}
                  {ids.twitter_id && (
                    <a href={`https://x.com/${ids.twitter_id}`} target="_blank" rel="noopener noreferrer" className="icon-btn bordered" aria-label="X (Twitter)">
                      <FaTwitter />
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0">
            <h1 className="page-title hidden sm:block">{person.name}</h1>

            <section className="mt-2 sm:mt-5">
              <h2 className="section-title mb-3">Biyografi</h2>
              {person.biography ? (
                <>
                  <p className={`whitespace-pre-line text-[15px] leading-relaxed text-white/70 ${!bioExpanded && bioLong ? 'line-clamp-6' : ''}`}>
                    {person.biography}
                  </p>
                  {bioLong && (
                    <button type="button" onClick={() => setBioExpanded(v => !v)} className="mt-2 text-sm font-semibold hover:underline">
                      {bioExpanded ? 'Daha az göster' : 'Devamını oku'}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-white/45">{person.name} için biyografi bulunmuyor.</p>
              )}
            </section>

            {knownFor.length > 0 && (
              <div className="-mx-[var(--gutter)] mt-10 sm:mx-0">
                <MediaRow title="Bilinen yapımları" items={knownFor} showType />
              </div>
            )}

            <section className="mt-2">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="section-title">Filmografi</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="segmented">
                    {FILTERS.map(f => (
                      <button key={f.id} type="button" className={filter === f.id ? 'active' : ''} onClick={() => { setFilter(f.id); setLimit(PAGE_SIZE); }}>
                        {f.label} <span className="opacity-60">{counts[f.id]}</span>
                      </button>
                    ))}
                  </div>
                  <select className="select !h-[40px] !w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sırala">
                    {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {visibleCredits.length ? (
                <>
                  <div className="media-grid stagger" key={`${filter}-${sort}`}>
                    {visibleCredits.slice(0, limit).map(credit => (
                      <MovieCard key={`${credit.media_type}-${credit.id}`} item={credit} showType={filter === 'all'} />
                    ))}
                  </div>
                  {visibleCredits.length > limit && (
                    <div className="mt-8 flex justify-center">
                      <button type="button" className="btn btn-secondary" onClick={() => setLimit(l => l + PAGE_SIZE)}>
                        Daha fazla göster ({visibleCredits.length - limit})
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState title="Yapım bulunamadı" />
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

// Başka bir kişiye geçildiğinde filtre/sıralama durumunu sıfırla.
const Person = () => {
  const { id, slug } = useParams();
  return <PersonPage key={id} id={id} slug={slug} />;
};

export default Person;
