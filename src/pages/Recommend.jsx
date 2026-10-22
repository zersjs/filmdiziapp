import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheck, FaInfoCircle, FaMagic, FaPlay, FaPlus, FaRandom, FaStar } from 'react-icons/fa';
import { useMediaQuery, useRecommendations, useWatchProviders } from '../hooks';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import { StaticSeo } from '../components/Seo';
import MovieCard from '../components/UI/MovieCard';
import { EmptyState, ErrorState } from '../components/UI/States';
import { getImageUrl } from '../services/tmdb';
import {
  ERAS, MOODS, RUNTIMES, TYPES, buildPool, criteriaToSearch, parseCriteria, seededRandom,
} from '../services/recommend';
import { genreById } from '../lib/genres';
import {
  getDetailPath, getMediaLabel, getReleaseDate, getTitle, getWatchPath, getYear,
} from '../utils/helpers';

const keyOf = (item) => `${item.media_type}-${item.id}`;

const RUNTIME_LABEL_ANY = { kisa: 'Kısa', orta: 'Orta uzunlukta' };

const ChoiceGroup = ({ legend, options, value, onChange, multiple = false, renderLabel = o => o.label }) => (
  <fieldset className="choice-group">
    <legend>{legend}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const active = multiple ? value.includes(option.id) : value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`chip ${active ? 'active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option.id)}
          >
            {renderLabel(option)}
          </button>
        );
      })}
    </div>
  </fieldset>
);

// Kartlar hızla karıştırılıp öneride durur; hareket azaltma tercihinde doğrudan gösterilir.
const useShuffleReveal = (pickKey, posters) => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [frame, setFrame] = useState(null);
  const postersRef = useRef(posters);
  postersRef.current = posters;

  useEffect(() => {
    if (!pickKey || reduceMotion || postersRef.current.length < 3) {
      setFrame(null);
      return undefined;
    }
    let step = 0;
    setFrame(postersRef.current[0]);
    const timer = setInterval(() => {
      step += 1;
      if (step >= 9) {
        clearInterval(timer);
        setFrame(null);
        return;
      }
      setFrame(postersRef.current[step % postersRef.current.length]);
    }, 85);
    return () => clearInterval(timer);
  }, [pickKey, reduceMotion]);

  return frame;
};

const PickCard = ({ item, onNext }) => {
  const { actions } = useApp();
  const { toast } = useToast();
  const type = item.media_type;
  const inList = actions.isWatchLater(item.id, type);
  const year = getYear(getReleaseDate(item));
  const genres = (item.genre_ids || []).map(id => genreById(type, id)?.name).filter(Boolean).slice(0, 3);

  const toggleList = () => {
    const added = actions.toggleWatchLater(item, type);
    toast.success(added ? 'İzleme listene eklendi' : 'İzleme listenden çıkarıldı', 2000);
  };

  return (
    <article className="pick-card">
      <img className="pick-backdrop" src={getImageUrl(item.backdrop_path, 'w1280')} alt="" />
      <div className="pick-body">
        <img className="pick-poster" src={getImageUrl(item.poster_path, 'w342')} alt={getTitle(item)} />
        <div className="min-w-0">
          <div className="meta-row">
            <span className="badge">{getMediaLabel(type)}</span>
            {year && <span>{year}</span>}
            {item.vote_average > 0 && <span className="rating"><FaStar className="text-[11px]" /> {item.vote_average.toFixed(1)}</span>}
            {genres.length > 0 && <span className="hidden sm:inline">{genres.join(' · ')}</span>}
          </div>
          <h2 className="pick-title">{getTitle(item)}</h2>
          <p className="pick-overview">{item.overview}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={getWatchPath(item, type)} className="btn btn-primary"><FaPlay className="text-xs" /> İzle</Link>
            <Link to={getDetailPath(item, type)} className="btn btn-secondary"><FaInfoCircle /> Detaylar</Link>
            <button
              type="button"
              className={`icon-btn bordered !h-[42px] !w-[42px] ${inList ? 'active' : ''}`}
              onClick={toggleList}
              aria-pressed={inList}
              aria-label={inList ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
            >
              {inList ? <FaCheck /> : <FaPlus />}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onNext}>
              <FaRandom className="text-xs" /> Başka öner
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const Recommend = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const criteria = useMemo(() => parseCriteria(searchParams), [searchParams]);
  const { state } = useApp();
  const { data: providers = [] } = useWatchProviders('movie', 12);
  const resultRef = useRef(null);

  // Paylaşılan bir öneri bağlantısıyla gelindiyse doğrudan sonucu göster.
  const [asked, setAsked] = useState(() => searchParams.toString() !== '');
  const [seed, setSeed] = useState(() => Date.now());
  const [page, setPage] = useState(1);
  const [seen, setSeen] = useState(() => new Set());
  const [hideLibrary, setHideLibrary] = useState(true);
  // Öneri sırasında listeye ekleme yapılınca havuz yeniden karışmasın diye
  // kitaplık, öneri istendiği anda dondurulur.
  const [libraryKeys, setLibraryKeys] = useState(() => new Set());

  const queries = useRecommendations(criteria, page, asked);
  const isLoading = asked && queries.some(q => q.isLoading);
  const isError = queries.length > 0 && queries.every(q => q.isError);
  const lists = queries.map(q => q.data?.results || []);
  const totalPages = Math.max(0, ...queries.map(q => Math.min(q.data?.total_pages || 0, 20)));

  // Sorgu sonuçları her çizimde yeni dizi olarak gelir; havuz yalnızca veri gerçekten değişince karışır.
  const dataKey = queries.map(q => q.dataUpdatedAt).join();
  const pool = useMemo(
    () => buildPool(lists, { exclude: hideLibrary ? libraryKeys : new Set(), random: seededRandom(seed + page) }),
    [dataKey, hideLibrary, libraryKeys, seed, page]
  );
  const candidates = pool.filter(item => !seen.has(keyOf(item)));
  const pick = candidates[0];
  const alternates = candidates.slice(1, 7);
  const shuffleFrame = useShuffleReveal(pick && keyOf(pick), pool.map(item => item.poster_path));

  // Havuz bitince bir sonraki sayfaya geç.
  useEffect(() => {
    if (asked && !isLoading && pool.length > 0 && candidates.length === 0 && page < totalPages) {
      setPage(p => p + 1);
    }
  }, [asked, isLoading, pool.length, candidates.length, page, totalPages]);

  const snapshotLibrary = () => new Set(
    [...state.favorites, ...state.watchLater, ...state.continueWatching].map(item => `${item.media_type}-${item.id}`)
  );

  const update = (changes) => {
    const next = { ...criteria, ...changes };
    setSearchParams(criteriaToSearch(next), { replace: true });
    setPage(1);
    setSeen(new Set());
    if (asked) setLibraryKeys(snapshotLibrary());
  };

  const toggle = (key, id) => update({ [key]: criteria[key] === id ? '' : id });

  const toggleProvider = (id) => update({
    providers: criteria.providers.includes(id) ? criteria.providers.filter(p => p !== id) : [...criteria.providers, id],
  });

  const ask = () => {
    setLibraryKeys(snapshotLibrary());
    setSeed(Date.now());
    setSeen(new Set());
    setPage(1);
    setAsked(true);
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const next = () => {
    if (pick) setSeen(prev => new Set(prev).add(keyOf(pick)));
  };

  const runtimeLabel = (option) => (criteria.type === 'any' ? RUNTIME_LABEL_ANY[option.id] : option.label[criteria.type]);

  return (
    <>
      <StaticSeo path="/ne-izlesem" />
      <div className="page container-custom">
        <header className="mb-6">
          <h1 className="page-title flex items-center gap-3"><FaMagic className="text-[0.75em] text-white/50" /> Ne izlesem?</h1>
          <p className="page-subtitle">Birkaç seçim yap; ruh haline, vaktine ve platformlarına uyan iyi bir şey bulalım.</p>
        </header>

        <div className="recommend-layout">
          <form className="recommend-form surface" onSubmit={(event) => { event.preventDefault(); ask(); }}>
            <ChoiceGroup legend="Ne izlemek istersin?" options={TYPES} value={criteria.type} onChange={(id) => update({ type: id })} />
            <ChoiceGroup legend="Nasıl hissetmek istiyorsun?" options={MOODS} value={criteria.mood} onChange={(id) => toggle('mood', id)} />
            <ChoiceGroup
              legend="Ne kadar vaktin var?"
              options={RUNTIMES}
              value={criteria.runtime}
              onChange={(id) => toggle('runtime', id)}
              renderLabel={runtimeLabel}
            />
            <ChoiceGroup legend="Hangi dönem?" options={ERAS} value={criteria.era} onChange={(id) => toggle('era', id)} />
            {providers.length > 0 && (
              <fieldset className="choice-group">
                <legend>Hangi platformlar sende var?</legend>
                <div className="provider-picker">
                  {providers.map(provider => {
                    const id = String(provider.provider_id);
                    const active = criteria.providers.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`provider-toggle ${active ? 'active' : ''}`}
                        aria-pressed={active}
                        title={provider.provider_name}
                        onClick={() => toggleProvider(id)}
                      >
                        <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} loading="lazy" />
                        {active && <span className="provider-check"><FaCheck /></span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
            <label className="mt-1 flex cursor-pointer items-center gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                className="h-4 w-4 accent-white"
                checked={hideLibrary}
                onChange={(event) => { setHideLibrary(event.target.checked); setSeen(new Set()); }}
              />
              Listemdekileri ve izlediklerimi gösterme
            </label>
            <button type="submit" className="btn btn-primary btn-lg mt-2 w-full">
              <FaMagic className="text-sm" /> {asked ? 'Yeniden karıştır' : 'Bana bir şey öner'}
            </button>
          </form>

          <section ref={resultRef} className="recommend-result" aria-live="polite" aria-busy={isLoading || !!shuffleFrame}>
            {!asked ? (
              <div className="pick-placeholder">
                <FaMagic />
                <p className="font-semibold text-white/80">Seçimlerini yap, butona bas.</p>
                <p className="text-sm text-white/45">Hiçbir şey seçmezsen yüksek puanlı popüler yapımlar arasından seçeriz.</p>
              </div>
            ) : isError ? (
              <ErrorState onRetry={() => queries.forEach(q => q.refetch())} />
            ) : isLoading ? (
              <div className="pick-card skeleton" />
            ) : !pick ? (
              <EmptyState
                icon={FaRandom}
                title="Bu seçimlerle eşleşen yapım kalmadı"
                description={criteria.providers.length
                  ? 'Platform veya dönem seçimini gevşetmeyi dene.'
                  : 'Ruh hali, süre veya dönem seçimini değiştirmeyi dene.'}
              >
                {criteria.providers.length > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={() => update({ providers: [] })}>Platform filtresini kaldır</button>
                )}
              </EmptyState>
            ) : shuffleFrame ? (
              <div className="pick-card shuffling" aria-hidden="true">
                <img className="pick-shuffle-poster" src={getImageUrl(shuffleFrame, 'w342')} alt="" />
              </div>
            ) : (
              <>
                <div className="pick-reveal" key={keyOf(pick)}>
                  <PickCard item={pick} onNext={next} />
                </div>
                {alternates.length > 0 && (
                  <div className="mt-8">
                    <h2 className="section-title mb-4">Diğer seçenekler</h2>
                    <div className="media-grid compact stagger" key={`alt-${keyOf(pick)}`}>
                      {alternates.map(item => <MovieCard key={keyOf(item)} item={item} showType={criteria.type === 'any'} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Recommend;
