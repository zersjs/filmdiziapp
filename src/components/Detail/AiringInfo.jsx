import React, { useEffect, useState } from 'react';
import { FaClock, FaCalendarAlt } from 'react-icons/fa';
import { isGenericEpisodeName, relativeDay } from '../../utils/helpers';

const timeFormat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });

// Saat başına yeniden çizmek yerine bir sonraki dakikanın başında güncellenir.
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60000 - (Date.now() % 60000));
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return now;
};

// Türkçe bulunma eki saatin okunuşuna göre değişir: 23.41'de, 23.30'da, 22.00'de, 21.40'ta.
const UNIT_SUFFIX = { 1: 'de', 2: 'de', 3: 'te', 4: 'te', 5: 'te', 6: 'da', 7: 'de', 8: 'de', 9: 'da' };
const TENS_SUFFIX = { 1: 'da', 2: 'de', 3: 'da', 4: 'ta', 5: 'de' };

export const locativeSuffix = (number) => {
  if (number % 10) return UNIT_SUFFIX[number % 10];
  if (number >= 10) return TENS_SUFFIX[Math.floor(number / 10) % 10] || 'de';
  return 'da';
};

export const formatTimeAt = (date) => {
  const minutes = date.getMinutes();
  return `${timeFormat.format(date)}'${locativeSuffix(minutes || date.getHours())}`;
};

export const MovieEndTime = ({ runtime }) => {
  const now = useNow();
  if (!runtime) return null;
  const end = new Date(now.getTime() + runtime * 60000);
  const nextDay = end.getDate() !== now.getDate();
  return (
    <p className="airing-info">
      <FaClock className="flex-shrink-0 text-[11px]" />
      <span>Şimdi başlarsan {nextDay && 'gece '}<time dateTime={end.toISOString()}>{formatTimeAt(end)}</time> biter</span>
    </p>
  );
};

export const NextEpisode = ({ media }) => {
  const now = useNow();
  const next = media.next_episode_to_air;
  if (!next?.air_date) return null;
  return (
    <p className="airing-info accent">
      <FaCalendarAlt className="flex-shrink-0 text-[11px]" />
      <span className="min-w-0 truncate">
        Yeni bölüm {relativeDay(next.air_date, now)}: S{next.season_number}·B{next.episode_number}
        {!isGenericEpisodeName(next.name) && <span className="text-white/45"> — {next.name}</span>}
      </span>
    </p>
  );
};
