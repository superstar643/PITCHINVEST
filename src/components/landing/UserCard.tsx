import React, { useState } from 'react';
import { ThumbsUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  id?: number | string;
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
  availableStatus: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  id, name, startup, city, country, countryFlag, avatar, companyLogo,
  companyName, headerBg, investmentPercent, investmentAmount,
  commission, productImage1, productImage2, approvalRate, likes, views, availableStatus
}) => {
  const [messageClick, setMessageClick] = useState(false);
  const navigate = useNavigate();
  const onMessageClickHandle = () => {
    if (availableStatus) {
      // user is available -> go to messages (use id if present)
      if (typeof id !== 'undefined') {
        navigate(`/messages/${id}`);
      } else {
        navigate('/messages');
      }
      return;
    }

    // show unavailable overlay briefly
    setMessageClick(true);
    setTimeout(() => {
      setMessageClick(false);
    }, 1500);
  }

  return (
    <div
      className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => {
        if (typeof id !== 'undefined') navigate(`/user/${id}`);
      }}
    >
      {/* Header with background */}
      <div className="relative h-32" style={{ backgroundImage: `url(${headerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute -bottom-12 left-3">
          <img src={avatar} alt={name} className="w-28 h-28 shadow-lg rounded-full border-4 border-[#0a3d5c] object-cover" />
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

        <div className="flex gap-1 mb-2">
          <button
            className="flex-1 bg-[#0a3d5c] hover:bg-[#0C3C5AFF] text-white font-semibold py-0.5 transition text-xs rounded-full hover:bg-white hover:text-[#0a3d5c] border-2 border-[#0a3d5c]"
            onClick={(e) => { e.stopPropagation(); onMessageClickHandle(); }}
          >
            Message
          </button>
          <button
            className="flex-1 border-2 border-green-600 text-green-600 bg-white hover:bg-green-600  hover:text-white active:bg-green-700 active:border-green-700 rounded-full font-semibold py-0.5 transition text-xs"
            onClick={(e) => { e.stopPropagation(); if ((typeof (id) !== 'undefined')) { navigate(`/auction/${id}`); } }}
          >
            Auction
          </button>
        </div>

        <div className="text-center mb-2">
          <div className="text-lg font-bold">{investmentPercent}% por {investmentAmount}</div>
          <div className="text-green-600 font-bold text-xs">{commission}% Comissão</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <img src={productImage1} alt="Product 1" className="w-full h-24 object-cover rounded-lg" />
          <img src={productImage2} alt="Product 2" className="w-full h-24 object-cover rounded-lg" />
        </div>

        <div className="bg-gray-50 rounded-lg py-2 text-center">
          <div className="text-sm font-bold">Office Computer for utility purposes</div>
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
      {
        messageClick && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-30">
            <div className="px-6 py-8 mt-[30%] text-center bg-[rgba(0,0,0,0.5)] w-full" style={{ clipPath: "polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)" }}>
              <p className="text-lg font-bold tracking-widest text-white rotate-[350deg]">UNAVAILABLE</p>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default UserCard;
