import React, { useState } from 'react';
import { FaStar, FaUser } from 'react-icons/fa';
import { formatDate, truncateText } from '../../utils/helpers';

const Reviews = ({ reviews }) => {
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Henüz yorum yapılmamış.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Kullanıcı Yorumları</h2>
      <div className="space-y-6">
        {reviews.map(review => (
          <ReviewCard 
            key={review.id} 
            review={review}
            isExpanded={expandedReviews[review.id]}
            onToggle={() => toggleReview(review.id)}
          />
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ review, isExpanded, onToggle }) => {
  const avatarUrl = review.author_details?.avatar_path
    ? review.author_details.avatar_path.startsWith('/https')
      ? review.author_details.avatar_path.substring(1)
      : `https://image.tmdb.org/t/p/w185${review.author_details.avatar_path}`
    : null;

  const shouldTruncate = review.content.length > 400;
  const displayContent = isExpanded ? review.content : truncateText(review.content, 400);

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={review.author}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold">{review.author}</h4>
              <p className="text-sm text-gray-400">
                {formatDate(review.created_at)}
              </p>
            </div>
            
            {review.author_details?.rating && (
              <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded-full">
                <FaStar className="text-yellow-500 text-sm" />
                <span className="text-sm font-medium">
                  {review.author_details.rating}/10
                </span>
              </div>
            )}
          </div>

          <div className="text-gray-300 leading-relaxed">
            <p className="whitespace-pre-wrap">{displayContent}</p>
            
            {shouldTruncate && (
              <button
                onClick={onToggle}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2"
              >
                {isExpanded ? 'Daha az göster' : 'Devamını oku'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
