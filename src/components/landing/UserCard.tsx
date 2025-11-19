import React from 'react';
import { ThumbsUp, Eye } from 'lucide-react';

interface UserCardProps {
  name: string;
  startup: string;
  city: string;
  country: string;
  countryFlag: string;
  avatar: string;
  companyLogo: string;
  companyName: string;
  headerBg: string;
  investmentPercent: number;
  investmentAmount: string;
  commission: number;
  productImage1: string;
  productImage2: string;
  approvalRate: number;
  likes: number;
  views: number;
}

const UserCard: React.FC<UserCardProps> = ({ 
  name, startup, city, country, countryFlag, avatar, companyLogo, 
  companyName, headerBg, investmentPercent, investmentAmount, 
  commission, productImage1, productImage2, approvalRate, likes, views 
}) => {
  return (
    <div className="bg-white rounded-md shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Header with background */}
      <div className="relative h-16" style={{backgroundImage: `url(${headerBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute -bottom-7 left-3">
          <img src={avatar} alt={name} className="w-14 h-14 rounded-full border-2 border-white object-cover" />
        </div>
        <div className="absolute top-2 right-2 flex flex-col items-center bg-white rounded-full p-1">
          <img src={companyLogo} alt={companyName} className="w-8 h-8 rounded-full" />
        </div>
      </div>
      
      <div className="pt-8 px-3 pb-3">
        <div className="text-right text-xs font-semibold text-gray-700 mb-2">{companyName}</div>
        
        <div className="space-y-1 text-xs mb-2">
          <div><span className="font-semibold">Nome:</span> {name}</div>
          <div><span className="font-semibold">Startup:</span> {startup}</div>
          <div><span className="font-semibold">Cidade:</span> {city}</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">País:</span> {country} <span>{countryFlag}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-3 rounded-md transition text-sm">
            Message
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-md transition text-sm">
            Invest
          </button>
        </div>

        <div className="text-center mb-2">
          <div className="text-xl font-bold">{investmentPercent}% por {investmentAmount}</div>
          <div className="text-green-600 font-bold text-sm">{commission}% Comissão</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <img src={productImage1} alt="Product 1" className="w-full h-16 object-cover rounded-lg" />
          <img src={productImage2} alt="Product 2" className="w-full h-16 object-cover rounded-lg" />
        </div>

        <div className="text-center text-xs mb-1 font-semibold text-gray-600">Product description:</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">PITCH</button>
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">TECHNICAL SHEET</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">TECHNICAL SHEET</button>
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">FACT SHEET</button>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-600 mb-1">PUBLIC APPROVAL</div>
          <div className="text-xl font-bold text-green-600 mb-1">{approvalRate}%</div>
          <div className="flex justify-center gap-2 text-xs text-gray-600">
            <button aria-label="Like" className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">
              <ThumbsUp size={12} />
              <span>{likes}</span>
            </button>
            <button aria-label="Views" className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">
              <Eye size={12} />
              <span>{views}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
