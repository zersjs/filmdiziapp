import React, { useState } from 'react';
import { FaStar, FaUser } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';
import { EmptyState } from './States';

const avatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('/http')) return path.substring(1);
  return `https://image.tmdb.org/t/p/w185${path}`;
};

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatar = avatarUrl(review.author_details?.avatar_path);
  const rating = review.author_details?.rating;
  const isLong = review.content.length > 480;

  return (
    <article className="surface p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5 text-white/30">
          {avatar && !avatarFailed ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
          ) : (
            <FaUser />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{review.author}</p>
          <p className="text-xs text-white/40">{formatDate(review.created_at)}</p>
        </div>
        {rating ? (
          <span className="badge text-[var(--star)]">
            <FaStar className="text-[10px]" /> {rating}/10
          </span>
        ) : null}
      </header>
      <p className={`mt-4 whitespace-pre-line text-sm leading-relaxed text-white/70 ${!expanded && isLong ? 'line-clamp-6' : ''}`}>
        {review.content}
      </p>
      {isLong && (
        <button type="button" onClick={() => setExpanded(v => !v)} className="mt-2 text-sm font-semibold text-white hover:underline">
          {expanded ? 'Daha az göster' : 'Devamını oku'}
        </button>
      )}
    </article>
  );
};

const Reviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        title="Henüz inceleme yok"
        description="Bu içerik için TMDB'de yazılmış bir inceleme bulunmuyor."
      />
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
    </div>
  );
};

export default Reviews;
