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
      className="cursor-pointer bg-white shadow-md rounded-xl overflow-hidden hover:shadow-2xl transition"
    >
      <div className="flex items-start gap-2 flex-col">
        <div className={`w-full h-20 rounded-t-md`}
          style={{
            backgroundImage: `url(${coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center center"
          }} >
          <div className="text-white font-bold text-2xl tracking-wide bg-[#00000080] w-full h-full py-6 text-right pr-10">NEURO CAPITAL</div>
        </div>

        <div className='flex'>
          <img src={avatar ?? companyLogo} alt={name} className="w-24 h-24 -mt-10 ml-2 rounded-full object-cover border-4 border-white shadow-2xl" />
          <div className='flex flex-col'>
            <h3 className="ml-4 text-sm font-extrabold text-[#0a3d5c]">{name}</h3>
            <div className="ml-4 text-sm text-[#0a3d5c]">Investor</div>
            <div className="ml-4 text-md text-[#0a3d5c] font-extrabold">INVESTMENT PORTFOLIO</div>
            <div className="ml-4 text-[10px] text-[#0a3d5c]">OVERVIEW OF VENTURE CAPITAL HOLDINGS</div>
          </div>
        </div>
      </div>

      {/* partners logos */}
      <div className="mt-4 p-3 border-t">
        <div className="grid grid-cols-4 gap-3 items-center">
          {partners && partners.length > 0 ? ["","","","","","","","","","","",""].map((p, i) => (
            <div key={i} className="h-20 flex items-center justify-center bg-white shadow-lg rounded-lg">
              {partners[i] ? <img src={partners[i]} alt={`partner-${i}`} className="max-h-8 max-w-full object-contain" /> : <div className="text-xs text-gray-300">—</div>}
            </div>
          )) : (
            <div className="text-xs text-gray-400 col-span-3">No partner logos</div>
          )}
        </div>
      </div>
    </div >
  );
};

export default InvestorCard;
