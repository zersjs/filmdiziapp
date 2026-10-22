import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { PLAYER_STATE, UNPLAYABLE_ERRORS, loadYouTubeApi } from '../../services/youtube';

const AUTOPLAY_CHECK_MS = 1800;

// YouTube IFrame API ile kontrol edilen, kontrolleri gizli oynatıcı.
// mode: 'play' (oynat), 'pause' (kullanıcı durdurdu), 'preload' (yükle ama oynatma).
// İlerleme çubuğu React state'i yerine doğrudan DOM'a (progressRef) yazılır; saniyede
// 60 kez yeniden render olmaz.
const ShortPlayer = forwardRef(({
  videoKey,
  mode,
  muted,
  startSeconds = 0,
  progressRef,
  onStatus,
  onEnded,
  onUnplayable,
  onAutoplayBlocked,
}, ref) => {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const desired = useRef({ mode, muted });
  desired.current = { mode, muted };

  // Geri çağırmaları ref'te tut; oynatıcıyı yeniden oluşturmadan güncel kalsınlar.
  const handlers = useRef({});
  handlers.current = { onStatus, onEnded, onUnplayable, onAutoplayBlocked };

  const apply = () => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    const { mode: wantedMode, muted: wantMuted } = desired.current;
    try {
      if (wantMuted) player.mute();
      else player.unMute();
      if (wantedMode === 'play') player.playVideo();
      else player.pauseVideo();
    } catch {
      // Oynatıcı yok edilirken komut gelebilir; yok say.
    }
  };

  useEffect(() => {
    let cancelled = false;
    let player = null;
    handlers.current.onStatus?.('loading');

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const mount = document.createElement('div');
        hostRef.current.appendChild(mount);
        player = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          videoId: videoKey,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: Math.max(0, Math.floor(startSeconds)),
            cc_lang_pref: 'tr',
            hl: 'tr',
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              readyRef.current = true;
              apply();
            },
            onStateChange: ({ data }) => {
              const status = {
                [PLAYER_STATE.PLAYING]: 'playing',
                [PLAYER_STATE.PAUSED]: 'paused',
                [PLAYER_STATE.BUFFERING]: 'buffering',
                [PLAYER_STATE.ENDED]: 'ended',
                [PLAYER_STATE.CUED]: 'ready',
              }[data];
              if (status) handlers.current.onStatus?.(status);
              if (data === PLAYER_STATE.ENDED) handlers.current.onEnded?.();
            },
            onError: ({ data }) => {
              handlers.current.onStatus?.('error');
              if (UNPLAYABLE_ERRORS.has(data)) handlers.current.onUnplayable?.(data);
            },
            onAutoplayBlocked: () => handlers.current.onAutoplayBlocked?.(),
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) {
          handlers.current.onStatus?.('error');
          handlers.current.onUnplayable?.('api');
        }
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      playerRef.current = null;
      try {
        player?.destroy();
      } catch {
        // zaten kaldırılmış
      }
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
    // Oynatıcı yalnızca video değişince yeniden oluşturulur.
  }, [videoKey]);

  // İstenen durum değişince oynatıcıya uygula
  useEffect(() => {
    apply();
  }, [mode, muted]);

  // Sesli otomatik oynatma engellendiyse fark et (onAutoplayBlocked olayını desteklemeyen
  // tarayıcılar için yedek). Yalnızca video hiç başlamadıysa engellenmiş sayılır;
  // bitmiş veya duraklatılmış video yanlış alarm vermesin.
  useEffect(() => {
    if (mode !== 'play' || muted) return undefined;
    const timer = setTimeout(() => {
      const state = playerRef.current?.getPlayerState?.();
      if (readyRef.current && (state === PLAYER_STATE.UNSTARTED || state === PLAYER_STATE.CUED)) {
        handlers.current.onAutoplayBlocked?.();
      }
    }, AUTOPLAY_CHECK_MS);
    return () => clearTimeout(timer);
  }, [mode, muted, videoKey]);

  // İlerleme çubuğu
  useEffect(() => {
    if (mode !== 'play' || !progressRef) return undefined;
    let frame;
    const tick = () => {
      const player = playerRef.current;
      if (player && readyRef.current && progressRef.current) {
        const duration = player.getDuration?.() || 0;
        const current = player.getCurrentTime?.() || 0;
        progressRef.current.style.transform = `scaleX(${duration ? Math.min(current / duration, 1) : 0})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, progressRef]);

  useImperativeHandle(ref, () => ({
    seekToFraction(fraction) {
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      const duration = player.getDuration?.() || 0;
      if (duration) player.seekTo(Math.max(0, Math.min(fraction, 0.999)) * duration, true);
    },
    restart() {
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      player.seekTo(0, true);
      player.playVideo();
    },
  }), []);

  return <div ref={hostRef} className="short-player" aria-hidden="true" />;
});

ShortPlayer.displayName = 'ShortPlayer';

export default ShortPlayer;
