import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaBookmark, FaHeart, FaPlay, FaSyncAlt, FaCopy, FaEye, FaEyeSlash, FaDownload, FaUpload, FaTrash, FaLink, FaShieldAlt,
} from 'react-icons/fa';
import { useApp } from '../contexts';
import { useToast } from '../components/UI/Toast';
import { ConfirmModal } from '../components/UI/Modal';
import { SYNC_ERROR_MESSAGES, SyncError, formatSyncKey, isValidSyncKey, normalizeSyncKey } from '../services/sync';

const formatRelative = (iso) => {
  if (!iso) return null;
  const diff = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
};

const errorMessage = (error) =>
  SYNC_ERROR_MESSAGES[error instanceof SyncError ? error.code : error] || SYNC_ERROR_MESSAGES.server_error;

const copyText = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

const Section = ({ title, description, children }) => (
  <section className="surface p-5 sm:p-6">
    <h2 className="text-base font-bold">{title}</h2>
    {description && <p className="mt-1 text-sm leading-relaxed text-white/50">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const SyncPanel = () => {
  const { sync } = useApp();
  const { toast } = useToast();
  const { hash } = useLocation();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // "…/ayarlar#kod=XXXXX" bağlantısıyla gelinirse kodu doldur (otomatik bağlanma yok).
  useEffect(() => {
    const match = /kod=([0-9A-Za-z-]+)/.exec(hash);
    if (match && !sync.enabled) setCode(formatSyncKey(normalizeSyncKey(match[1])));
  }, [hash, sync.enabled]);

  const run = async (name, fn) => {
    setBusy(name);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (!sync.enabled) {
    const normalized = normalizeSyncKey(code);
    return (
      <>
        {error && <div className="notice-error" role="alert">{error}</div>}
        <button
          type="button"
          className="btn btn-primary"
          disabled={!!busy}
          onClick={() => run('enable', async () => {
            await sync.enable();
            setRevealed(true);
            toast.success('Senkronizasyon açıldı. Kodu diğer cihazına gir.');
          })}
        >
          <FaSyncAlt className={`text-xs ${busy === 'enable' ? 'animate-spin' : ''}`} /> Senkronizasyonu başlat
        </button>

        <form
          className="mt-6 border-t border-white/[0.06] pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            run('connect', async () => {
              await sync.connect(normalized);
              setCode('');
              toast.success('Kitaplıklar birleştirildi');
            });
          }}
        >
          <label htmlFor="sync-code" className="field-label">Başka bir cihazda zaten kodun var mı?</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="sync-code"
              className="input font-mono uppercase tracking-wider"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <button type="submit" className="btn btn-secondary flex-shrink-0" disabled={!isValidSyncKey(normalized) || !!busy}>
              <FaLink className="text-xs" /> {busy === 'connect' ? 'Bağlanıyor…' : 'Bağlan'}
            </button>
          </div>
        </form>
      </>
    );
  }

  const formatted = formatSyncKey(sync.key);
  const shareLink = `${window.location.origin}/ayarlar#kod=${sync.key}`;
  const statusText = {
    syncing: 'Eşitleniyor…',
    ok: `Son eşitleme: ${formatRelative(sync.lastSyncedAt)}`,
    error: SYNC_ERROR_MESSAGES[sync.error] || SYNC_ERROR_MESSAGES.server_error,
    idle: sync.lastSyncedAt ? `Son eşitleme: ${formatRelative(sync.lastSyncedAt)}` : 'Bekleniyor',
  }[sync.state];

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className={`h-2 w-2 rounded-full ${sync.state === 'error' ? 'bg-red-400' : sync.state === 'syncing' ? 'animate-pulse bg-yellow-300' : 'bg-green-400'}`} />
        <span className={sync.state === 'error' ? 'text-red-300' : 'text-white/60'}>{statusText}</span>
      </div>

      <label className="field-label">Senkron kodun</label>
      <div className="flex items-center gap-2">
        <code className="input no-scrollbar flex items-center overflow-x-auto whitespace-nowrap font-mono text-[13px] tracking-wide sm:text-[15px] sm:tracking-wider">
          {revealed ? formatted : formatted.replace(/[0-9A-Z]/g, '•')}
        </code>
        <button type="button" className="icon-btn bordered flex-shrink-0" onClick={() => setRevealed(v => !v)} aria-label={revealed ? 'Kodu gizle' : 'Kodu göster'}>
          {revealed ? <FaEyeSlash /> : <FaEye />}
        </button>
        <button
          type="button"
          className="icon-btn bordered flex-shrink-0"
          onClick={async () => {
            const ok = await copyText(formatted);
            toast[ok ? 'success' : 'error'](ok ? 'Kod kopyalandı' : 'Kopyalanamadı', 2000);
          }}
          aria-label="Kodu kopyala"
        >
          <FaCopy />
        </button>
      </div>
      <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-white/40">
        <FaShieldAlt className="mt-0.5 flex-shrink-0" />
        Kodu bilen herkes listeni görebilir ve değiştirebilir. Şifre gibi sakla, kimseyle paylaşma.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary btn-sm" disabled={sync.state === 'syncing'} onClick={sync.syncNow}>
          <FaSyncAlt className={`text-xs ${sync.state === 'syncing' ? 'animate-spin' : ''}`} /> Şimdi eşitle
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            const ok = await copyText(shareLink);
            toast[ok ? 'success' : 'error'](ok ? 'Bağlantı kopyalandı; diğer cihazında aç.' : 'Kopyalanamadı', 3000);
          }}
        >
          <FaLink className="text-xs" /> Cihaz bağlantısını kopyala
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { sync.disconnect(); toast.info('Bu cihazda senkronizasyon kapatıldı'); }}>
          Bu cihazda kapat
        </button>
        <button type="button" className="btn btn-ghost btn-sm text-red-300" onClick={() => setConfirmDelete(true)}>
          Sunucudaki veriyi sil
        </button>
      </div>
      {error && <div className="notice-error mt-4" role="alert">{error}</div>}

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => run('delete', async () => {
          await sync.deleteRemote();
          sync.disconnect();
          toast.success('Sunucudaki kitaplık silindi. Bu cihazdaki veriler duruyor.');
        })}
        title="Sunucudaki veri silinsin mi?"
        message="Bu koda bağlı kitaplık sunucudan silinir ve kod geçersiz olur. Bu cihazdaki listelerin silinmez; diğer cihazlar artık eşitlenemez."
        confirmText="Sil"
      />
    </>
  );
};

const Settings = () => {
  const { state, actions } = useApp();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const stats = [
    { label: 'İzleme listesi', value: state.watchLater.length, to: '/watch-later', icon: FaBookmark },
    { label: 'Favoriler', value: state.favorites.length, to: '/favorites', icon: FaHeart },
    { label: 'Devam edilenler', value: state.continueWatching.length, to: '/', icon: FaPlay },
  ];

  const download = () => {
    const blob = new Blob([JSON.stringify(actions.exportLibrary(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sinefix-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('Dosya çok büyük (en fazla 1 MB)');
      return;
    }
    try {
      const count = actions.importLibrary(JSON.parse(await file.text()));
      toast.success(`${count} öğe içe aktarıldı ve mevcut listelerle birleştirildi`);
    } catch {
      toast.error('Geçerli bir SINEFIX yedeği değil');
    }
  };

  return (
    <>
      <Helmet>
        <title>Kitaplık ve senkronizasyon - SINEFIX</title>
      </Helmet>

      <div className="page container-custom max-w-3xl">
        <h1 className="page-title">Kitaplık ve senkronizasyon</h1>
        <p className="page-subtitle">Hesap gerekmez. Listelerin bu tarayıcıda saklanır.</p>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map(({ label, value, to, icon: Icon }) => (
            <Link key={label} to={to} className="surface p-3 hover:border-white/15 sm:p-4">
              <Icon className="text-sm text-white/40" />
              <p className="mt-2 text-2xl font-bold">{value}</p>
              <p className="text-xs text-white/45">{label}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <Section
            title="Cihazlar arası senkronizasyon"
            description="Telefonun ve bilgisayarın aynı listeleri görsün. E-posta veya şifre yok: rastgele üretilen bir kodla eşitlenir. Sunucuda yalnızca film/dizi listelerin tutulur; kodun kendisi saklanmaz."
          >
            <SyncPanel />
          </Section>

          <Section title="Yedekleme" description="Listelerini bir dosyaya indir veya bir yedekten geri yükle. Geri yükleme mevcut listelerle birleştirilir.">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={download}>
                <FaDownload className="text-xs" /> Yedeği indir
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                <FaUpload className="text-xs" /> Yedekten yükle
              </button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={upload} />
            </div>
          </Section>

          <Section title="Verileri temizle" description="İzleme listesi, favoriler ve devam edilenler silinir. Senkronizasyon açıksa diğer cihazlardan da silinir.">
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
              <FaTrash className="text-xs" /> Tüm kitaplığı temizle
            </button>
          </Section>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          actions.clearAll();
          toast.success('Kitaplık temizlendi');
        }}
        title="Tüm kitaplık temizlensin mi?"
        message="Bu işlem geri alınamaz. İstersen önce yedek indir."
        confirmText="Temizle"
      />
    </>
  );
};

export default Settings;
