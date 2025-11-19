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
  id: number;
  title: string;
  artist: string;
  subtitle?: string;
  imageUrl: string;
  category: string;
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
  const navigate = useNavigate();

  const handleClick = () => {
    if (availableStatus) {
      onClick();
      navigate(`/gallery/${id}`);
    } else {
      // still navigate to detail to show full info even if unavailable
      setIsClicked(true);
    }
    setTimeout(() => {
      setIsClicked(false);
    }, 1500);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer mx-1 bg-white rounded-lg overflow-hidden border-2 border-[#0a3d5c] hover:shadow-lg transition-all duration-300 w-full h-full"
    >
      <div className="relative overflow-hidden aspect-[16/12]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />


        {/* Top-right likes */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 px-2 py-1 rounded-full shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0a3d5c]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{likes ?? 0}</span>
        </div>

        {/* Bottom-left availability label */}
        {/* Top-left badges */}
        {badges && badges.length > 0 && (
          <div className="absolute bottom-3 left-3 z-20 flex gap-2">
            {badges.slice(0, 3).map((b, i) => (
              <span key={i} className="text-[10px] font-semibold bg-white/90 text-gray-700 px-2 py-1 rounded-full shadow-sm">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Click unavailable overlay */}
        {isClicked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-30">
            <div className="px-6 py-8 mt-[30%] text-center bg-[rgba(0,0,0,0.5)] w-full" style={{ clipPath: "polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)" }}>
              <p className="text-lg font-bold tracking-widest text-white rotate-[350deg]">UNAVAILABLE</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className='flex justify-between items-center0'>
          <div className='flex flex-col'>
            <h3 className="text-lg font-bold text-[#0a3d5c] mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
          </div>

          <div>£10.0M</div>
        </div>

        <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Tag size={12} />
            <span>{artist}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L11 9.586V7z" clipRule="evenodd" />
            </svg>
            <span className="capitalize">{/* category placeholder */}</span>
          </div>
        </div>

        {/* Author row */}
        {author && (
          <div className="flex items-center gap-3 mb-3 border-b border-gray-200 pb-4">
            <img src={author.avatarUrl} alt={author.name} className="w-16 h-16 rounded-full object-cover border" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-[#0a3d5c]">{author.name}</span>
                {author.verified && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {author.country && <p className="text-xs text-gray-400">{author.country}</p>}
            </div>
          </div>
        )}

        {/* Action pills */}
        <div className='flex items-center justify-start mb-3'>
          {actions && actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((a, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-50 text-gray-700 border">{a}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{views ?? 0} views</span>
          <span>{date ?? ''}</span>
        </div>
      </div>
    </div>
  );
};
