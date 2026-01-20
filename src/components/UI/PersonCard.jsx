import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaUser } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import 'react-lazy-load-image-component/src/effects/blur.css';

const PersonCard = ({ person }) => {
  const [imageError, setImageError] = useState(false);
  const profileImage = person.profile_path 
    ? getImageUrl(person.profile_path, 'w185')
    : null;

  return (
    <Link 
      to={`/person/${person.id}`}
      className="group block transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/5"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-900 mb-3 shadow-lg">
        {profileImage && !imageError ? (
          <LazyLoadImage
            src={profileImage}
            alt={person.name}
            effect="blur"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
            <FaUser className="text-6xl mb-4" />
            <h3 className="text-sm font-medium text-center px-4 line-clamp-2">{person.name}</h3>
            {person.character && (
              <p className="text-xs mt-1 text-center px-2 line-clamp-1">{person.character}</p>
            )}
            {person.job && (
              <p className="text-xs mt-1 text-center px-2 line-clamp-1">{person.job}</p>
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="font-medium text-sm line-clamp-1 text-shadow">
              {person.name}
            </h3>
            {person.character && (
              <p className="text-xs text-gray-300 line-clamp-1 mt-1">
                {person.character}
              </p>
            )}
            {person.job && (
              <p className="text-xs text-gray-300 line-clamp-1 mt-1">
                {person.job}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-gray-300 transition-colors text-white">
          {person.name}
        </h3>
        {person.character && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-1">
            {person.character}
          </p>
        )}
        {person.job && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-1">
            {person.job}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PersonCard;
