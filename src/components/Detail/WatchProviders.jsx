import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../services/tmdb';
import { isFutureDate } from '../../utils/helpers';

const GROUPS = [
  { key: 'flatrate', label: 'Abonelikle' },
  { key: 'free', label: 'Ücretsiz' },
  { key: 'ads', label: 'Reklamlı' },
  { key: 'rent', label: 'Kirala' },
  { key: 'buy', label: 'Satın al' },
];

// Türkiye'de nerede izlenebileceği (TMDB ↔ JustWatch verisi).
// Abonelik platformları, o platformdaki diğer içerikleri listeleyen sayfaya bağlanır.
const WatchProviders = ({ media, mediaType }) => {
  const region = media['watch/providers']?.results?.TR;
  const browsePath = mediaType === 'tv' ? '/series' : '/movies';
  const groups = GROUPS
    .map(group => ({ ...group, providers: region?.[group.key] || [] }))
    .filter(group => group.providers.length);
  const unreleased = isFutureDate(media.release_date || media.first_air_date);

  return (
    <section aria-labelledby="where-to-watch">
      <h2 id="where-to-watch" className="section-title mb-3">Nerede izlenir?</h2>
      {groups.length === 0 ? (
        <p className="text-sm text-white/50">
          {unreleased
            ? 'Henüz yayınlanmadı; çıktığında hangi platformda olduğunu burada göreceksin.'
            : "Şu an Türkiye'deki dijital platformlarda bulunmuyor."}
        </p>
      ) : (
        <div className="providers">
          {groups.map(group => (
            <div key={group.key} className="provider-group">
              <p className="provider-group-label">{group.label}</p>
              <ul className="provider-list">
                {group.providers.map(provider => {
                  const logo = (
                    <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} loading="lazy" width="44" height="44" />
                  );
                  const subscription = group.key === 'flatrate';
                  return (
                    <li key={provider.provider_id}>
                      {subscription ? (
                        <Link
                          to={`${browsePath}?provider=${provider.provider_id}`}
                          className="provider"
                          title={`${provider.provider_name}'teki diğer ${mediaType === 'tv' ? 'diziler' : 'filmler'}`}
                        >
                          {logo}
                        </Link>
                      ) : (
                        <span className="provider" title={provider.provider_name}>{logo}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-white/30">
        Platform verileri{' '}
        {region?.link ? (
          <a href={region.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/60">JustWatch</a>
        ) : 'JustWatch'}{' '}
        tarafından sağlanır.
      </p>
    </section>
  );
};

export default WatchProviders;
