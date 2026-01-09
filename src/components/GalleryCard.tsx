import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';

interface Author {
  name: string;
  avatarUrl?: string;
  country?: string;
  verified?: boolean;
}

interface GalleryCardProps {
  id: number | string;
  title: string;
  artist: string;
  subtitle?: string;
  imageUrl: string;
  category?: string;
  views?: number;
  availableStatus: boolean;
  availableLabel?: string;
  badges?: string[];
  likes?: number;
  author?: Author;
  actions?: string[];
  date?: string;
  onClick: () => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  id,
  title,
  artist,
  subtitle,
  imageUrl,
  category,
  views,
  availableStatus,
  availableLabel,
  badges,
  likes,
  author,
  actions,
  date,
  onClick,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    onClick && onClick();
    navigate(`/gallery/${id}`);
  };

  // Truncate long titles
  const truncateTitle = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer mx-1 bg-white rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 w-full h-full flex flex-col"
    >
      <div className="relative overflow-hidden aspect-[16/12] bg-gray-100">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500 mt-2">No Image</p>
            </div>
          </div>
        )}

        {/* Top-right likes */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 px-2 py-1 rounded-full shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0a3d5c]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{likes ?? 0}</span>
        </div>

        {/* Top-left badges */}
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex gap-2 flex-wrap max-w-[60%]">
            {badges.slice(0, 3).map((b, i) => (
              <span key={i} className="text-[10px] font-semibold bg-white/90 text-gray-700 px-2 py-1 rounded-full shadow-sm">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Title and Price Row - Better alignment for long titles */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#0a3d5c] mb-1 line-clamp-2" title={title}>
              {truncateTitle(title, 45)}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 line-clamp-1" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-lg font-bold text-[#d5b775] whitespace-nowrap">£10.0M</span>
          </div>
        </div>

        {/* Artist and Category Row */}
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-1">
            <Tag size={14} className="text-gray-400" />
            <span className="font-medium">{artist}</span>
          </div>
          {category && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a2 2 0 012-2h5a1 1 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="capitalize text-gray-600">{category}</span>
            </div>
          )}
        </div>

        {/* Author Section */}
        {author && (
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
            {author.avatarUrl ? (
              <img 
                src={author.avatarUrl} 
                alt={author.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/circle cx="12" cy="7" r="4"%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0a3d5c] truncate">{author.name}</span>
                {author.verified && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {author.country && (
                <p className="text-xs text-gray-500 truncate">{author.country}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Pills */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {actions.map((a, i) => (
              <span 
                key={i} 
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#0a3d5c]/10 text-[#0a3d5c] border border-[#0a3d5c]/20"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Footer - Views and Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {views ?? 0} views
          </span>
          {date && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
