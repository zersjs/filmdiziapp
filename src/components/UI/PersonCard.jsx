import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { getImageUrl } from '../../services/tmdb';
import { getPersonPath } from '../../utils/helpers';

const PersonCard = ({ person, subtitle }) => {
  const [failed, setFailed] = useState(false);
  const role = subtitle ?? (person.character || person.roles?.[0]?.character || person.job || person.known_for_department);

  return (
    <Link to={getPersonPath(person)} className="group block min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-[#111]">
        {person.profile_path && !failed ? (
          <img
            src={getImageUrl(person.profile_path, 'w185')}
            srcSet={`${getImageUrl(person.profile_path, 'w185')} 185w, ${getImageUrl(person.profile_path, 'h632')} 421w`}
            sizes="(min-width: 1024px) 180px, 33vw"
            alt={person.name}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-white/15">
            <FaUser />
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-[13.5px] font-semibold text-white/90">{person.name}</p>
      {role && <p className="line-clamp-1 text-xs text-white/45">{role}</p>}
    </Link>
  );
};

export default PersonCard;
