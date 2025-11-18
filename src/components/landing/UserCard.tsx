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
      <div className="relative h-20" style={{backgroundImage: `url(${headerBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute -bottom-8 left-4">
          <img src={avatar} alt={name} className="w-20 h-20 rounded-full border-4 border-white object-cover" />
        </div>
        <div className="absolute top-2 right-2 flex flex-col items-center bg-white rounded-full p-2">
          <img src={companyLogo} alt={companyName} className="w-10 h-10 rounded-full" />
        </div>
      </div>
      
      <div className="pt-10 px-4 pb-4">
        <div className="text-right text-sm font-semibold text-gray-700 mb-2">{companyName}</div>
        
        <div className="space-y-1 text-sm mb-3">
          <div><span className="font-semibold">Nome:</span> {name}</div>
          <div><span className="font-semibold">Startup:</span> {startup}</div>
          <div><span className="font-semibold">Cidade:</span> {city}</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">País:</span> {country} <span>{countryFlag}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition">
            Message
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Invest
          </button>
        </div>

        <div className="text-center mb-3">
          <div className="text-2xl font-bold">{investmentPercent}% por {investmentAmount}</div>
          <div className="text-green-600 font-bold text-lg">{commission}% Comissão</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <img src={productImage1} alt="Product 1" className="w-full h-24 object-cover rounded-lg" />
          <img src={productImage2} alt="Product 2" className="w-full h-24 object-cover rounded-lg" />
        </div>

        <div className="text-center text-sm mb-2 font-semibold text-gray-600">Product description:</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">PITCH</button>
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">TECHNICAL SHEET</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">TECHNICAL SHEET</button>
          <button className="border border-gray-300 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-50">FACT SHEET</button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">PUBLIC APPROVAL</div>
          <div className="text-2xl font-bold text-green-600 mb-1">{approvalRate}%</div>
          <div className="flex justify-center gap-3 text-xs text-gray-600">
            <button aria-label="Like" className="flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
              <ThumbsUp size={14} />
              <span>{likes}</span>
            </button>
            <button aria-label="Views" className="flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
              <Eye size={14} />
              <span>{views}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
