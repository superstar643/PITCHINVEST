import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, Eye } from 'lucide-react';

interface InvestorCardProps {
  id: number | string;
  name: string;
  startup: string;
  avatar?: string;
  companyLogo?: string;
  companyName?: string;
  city?: string;
  country?: string;
  countryFlag?: string;
  partners?: string[];
  coverImage?: string;
}

const InvestorCard: React.FC<InvestorCardProps> = ({ id, name, startup, avatar, companyLogo, companyName, city, country, countryFlag, partners = [], coverImage }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/investor/${id}`)}
      className="cursor-pointer bg-white border-2 border-[#0a3d5c] rounded-xl overflow-hidden hover:shadow-lg transition"
    >
      <div className="flex items-start gap-4 flex-col">
        <img src={coverImage} alt={`${name} cover`} className="w-full h-32 object-cover rounded-t-md " />

        <div className='flex'>
          <img src={avatar ?? companyLogo} alt={name} className="w-20 h-20 -mt-14 ml-4 rounded-full object-cover border-4 border-white shadow-md" />
          <h3 className="ml-4 text-lg font-semibold text-[#0a3d5c]">{name}</h3>
        </div>

        <div className="flex-1 flex items-center justify-between w-full px-4">
          <div className="text-md text-gray-500 mt-1">Investor</div>
          <div className="text-lg text-[#0a3d5c] mt-2">
            {city ?? ''}{city && country ? ', ' : ''}{country ?? ''}
            {countryFlag ? <span className="ml-1">{countryFlag}</span> : null}
          </div>
        </div>
      </div>

      {/* partners logos */}
      <div className="mt-4 pt-3 border-t">
        <div className="grid grid-cols-3 gap-3 items-center">
          {partners && partners.length > 0 ? partners.map((p, i) => (
            <div key={i} className="h-10 flex items-center justify-center bg-white">
              {p ? <img src={p} alt={`partner-${i}`} className="max-h-8 max-w-full object-contain" /> : <div className="text-xs text-gray-300">—</div>}
            </div>
          )) : (
            <div className="text-xs text-gray-400 col-span-3">No partner logos</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorCard;
