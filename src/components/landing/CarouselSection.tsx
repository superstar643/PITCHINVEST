import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ThumbsUp, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import users from '@/lib/usersData';

const carouselImages = [
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424373352_9e70bd44.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424375333_ada89fa6.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424377234_349ea0c2.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424379240_e4343003.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424381216_4ccb077e.webp',
];

const investorData = [
  {
    // Left Card
    left: users[0],
    // Right Card
    right: {
      avatar: 'assets/2.avif',
      company: 'NEURO CAPITAL',
      name: 'Dr. Yuki Nakamura',
      location: 'Tokyo, Japan',
      title: 'Healthcare Tech Investor',
      portfolio: [
        {
          name: 'NeuroLink',
          image: 'assets/portfolio1.png'
        },
        {
          name: 'BrainWave',
          image: 'assets/portfolio2.png'
        },
        {
          name: 'MediTech',
          image: 'assets/portfolio3.png'
        },
        {
          name: 'HealthAI',
          image: 'assets/portfolio4.png'
        },
        {
          name: 'BioSync',
          image: 'assets/portfolio5.png'
        },
        {
          name: 'CogniCare',
          image: 'assets/portfolio6.png'
        }]
    }
  },
  {
    left: users[1],
    right: {
      avatar: 'assets/4.avif',
      company: 'ASIA VENTURES',
      name: 'Mr. James Wong',
      location: 'Singapore',
      title: 'Tech Entrepreneur',
      portfolio: [
        {
          name: 'NeuroLink',
          image: 'assets/portfolio1.png'
        },
        {
          name: 'BrainWave',
          image: 'assets/portfolio2.png'
        },
        {
          name: 'MediTech',
          image: 'assets/portfolio3.png'
        },
        {
          name: 'HealthAI',
          image: 'assets/portfolio4.png'
        },
        {
          name: 'BioSync',
          image: 'assets/portfolio5.png'
        },
        {
          name: 'CogniCare',
          image: 'assets/portfolio6.png'
        }]
    }
  },
  {
    left: users[2],
    right: {
      avatar: 'assets/6.avif',
      company: 'EU CAPITAL',
      name: 'Ms. Marie Dubois',
      location: 'Paris, France',
      title: 'Sustainable Tech Investor',
      portfolio: [
        {
          name: 'NeuroLink',
          image: 'assets/portfolio1.png'
        },
        {
          name: 'BrainWave',
          image: 'assets/portfolio2.png'
        },
        {
          name: 'MediTech',
          image: 'assets/portfolio3.png'
        },
        {
          name: 'HealthAI',
          image: 'assets/portfolio4.png'
        },
        {
          name: 'BioSync',
          image: 'assets/portfolio5.png'
        },
        {
          name: 'CogniCare',
          image: 'assets/portfolio6.png'
        }]
    }
  },
  {
    left: users[3],
    right: {
      avatar: 'assets/2.avif',
      company: 'SILICON VALLEY FUND',
      name: 'Lisa Anderson',
      location: 'Palo Alto, USA',
      title: 'Venture Capital Partner',
      portfolio: [
        {
          name: 'NeuroLink',
          image: 'assets/portfolio1.png'
        },
        {
          name: 'BrainWave',
          image: 'assets/portfolio2.png'
        },
        {
          name: 'MediTech',
          image: 'assets/portfolio3.png'
        },
        {
          name: 'HealthAI',
          image: 'assets/portfolio4.png'
        },
        {
          name: 'BioSync',
          image: 'assets/portfolio5.png'
        },
        {
          name: 'CogniCare',
          image: 'assets/portfolio6.png'
        }]
    }
  },
  {
    left: users[4],
    right: {
      avatar: 'assets/4.avif',
      company: 'ASIA TECH VENTURES',
      name: 'Priya Sharma',
      location: 'Bangalore, India',
      title: 'Digital Finance Investor',
      portfolio: [
        {
          name: 'NeuroLink',
          image: 'assets/portfolio1.png'
        },
        {
          name: 'BrainWave',
          image: 'assets/portfolio2.png'
        },
        {
          name: 'MediTech',
          image: 'assets/portfolio3.png'
        },
        {
          name: 'HealthAI',
          image: 'assets/portfolio4.png'
        },
        {
          name: 'BioSync',
          image: 'assets/portfolio5.png'
        },
        {
          name: 'CogniCare',
          image: 'assets/portfolio6.png'
        }]
    }
  }
];

export default function CarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [leftCardMessageClick, setLeftCardMessageClick] = useState(false);
  const navigate = useNavigate();

  const handleLeftCardMessageClick = () => {
    const leftData = investorData[currentIndex].left;
    if (leftData.availableStatus) {
      if (typeof leftData.id !== 'undefined') {
        navigate(`/messages/${leftData.id}`);
      } else {
        navigate('/messages');
      }
      return;
    }
    setLeftCardMessageClick(true);
    setTimeout(() => {
      setLeftCardMessageClick(false);
    }, 1500);
  };

  // Trigger animation when index changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const getVisibleImages = () => {
    const prev = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
    const next = (currentIndex + 1) % carouselImages.length;
    const prevprev = (prev - 1 + carouselImages.length) % carouselImages.length;
    const nextnext = (next + 1) % carouselImages.length;
    return { prevprev, prev, current: currentIndex, next, nextnext };
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const visible = getVisibleImages();
  const progress = carouselImages.length > 1 ? (currentIndex / (carouselImages.length - 1)) * 100 : 100;

  return (
    <section className="py-10 md:py-20 bg-gradient-to-b from-slate-50 to-white min-h-[calc(100vh-100px)]">
      <div className="mx-auto px-4 md:px-8 2xl:px-32 lg:px-12 w-full">
        {/* Tagline */}
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-800">
            <span className="font-bold text-[#0a3d5c]">PITCH INVEST:</span> Where Your Capital Meets Next Big Idea.
          </h1>
        </div>
        {/* Desktop: horizontal layout (left card, carousel, right card) */}
        {/* Mobile: vertical layout (carousel on top, cards below) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-8">
          {/* Left Card - visible on desktop, moves below on mobile */}
          <div className="order-2 lg:order-1 w-full md:w-96 lg:w-[350px] z-20">
            <div
              key={investorData[currentIndex].left.id}
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => {
                if (typeof investorData[currentIndex].left.id !== 'undefined') navigate(`/user/${investorData[currentIndex].left.id}`);
              }}
            >
              {/* Header with background */}
              <div className="relative h-32 lg:h-36" style={{ backgroundImage: `url(${investorData[currentIndex].left.headerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute -bottom-14 left-4">
                  <img src={investorData[currentIndex].left.avatar} alt={investorData[currentIndex].left.name} className="w-32 h-32 lg:w-36 lg:h-36 shadow-lg rounded-full border-4 border-[#0a3d5c] object-cover" />
                </div>
                <div className="absolute top-2 right-2 flex flex-col items-center bg-white rounded-full p-1.5">
                  <img src={investorData[currentIndex].left.companyLogo} alt={investorData[currentIndex].left.companyName} className="w-10 h-10 rounded-full" />
                </div>
              </div>

              <div className="pt-10 px-4 pb-4">
                <div className="text-right text-sm font-semibold text-gray-700 mb-3">{investorData[currentIndex].left.companyName}</div>

                <div className="space-y-1.5 text-sm mb-3">
                  <div><span className="font-semibold">Nome:</span> {investorData[currentIndex].left.name}</div>
                  <div><span className="font-semibold">Startup:</span> {investorData[currentIndex].left.startup}</div>
                  <div><span className="font-semibold">Cidade:</span> {investorData[currentIndex].left.city}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">País:</span> {investorData[currentIndex].left.country} <span>{investorData[currentIndex].left.countryFlag}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    className="flex-1 bg-[#0a3d5c] hover:bg-[#0C3C5AFF] text-white font-semibold py-1.5 transition text-sm rounded-full hover:bg-white hover:text-[#0a3d5c] border-2 border-[#0a3d5c]"
                    onClick={(e) => { e.stopPropagation(); handleLeftCardMessageClick(); }}
                  >
                    Message
                  </button>
                  <button
                    className="flex-1 border-2 border-green-600 text-green-600 bg-white hover:bg-green-600 hover:text-white active:bg-green-700 active:border-green-700 rounded-full font-semibold py-1.5 transition text-sm"
                    onClick={(e) => { e.stopPropagation(); if ((typeof (investorData[currentIndex].left.id) !== 'undefined')) { navigate(`/auction/${investorData[currentIndex].left.id}`); } }}
                  >
                    Auction
                  </button>
                </div>

                <div className="text-center mb-3">
                  <div className="text-xl font-bold">{investorData[currentIndex].left.investmentPercent}% por {investorData[currentIndex].left.investmentAmount}</div>
                  <div className="text-green-600 font-bold text-sm">{investorData[currentIndex].left.commission}% Comissão</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <img src={investorData[currentIndex].left.productImage1} alt="Product 1" className="w-full h-24 lg:h-28 object-cover rounded-lg" />
                  <img src={investorData[currentIndex].left.productImage2} alt="Product 2" className="w-full h-24 lg:h-28 object-cover rounded-lg" />
                </div>

                <div className="bg-gray-50 rounded-lg py-3 text-center">
                  <div className="text-base font-bold">Office Computer for utility purposes</div>
                  <div className="text-sm text-gray-600 mb-1">PUBLIC APPROVAL</div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{investorData[currentIndex].left.approvalRate}%</div>
                  <div className="flex justify-center gap-3 text-sm text-gray-600">
                    <button aria-label="Like" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
                      <ThumbsUp size={14} className="text-yellow-500" fill="#eab308" />
                      <span>{investorData[currentIndex].left.likes}</span>
                    </button>
                    <button aria-label="Views" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
                      <Eye size={14} />
                      <span>{investorData[currentIndex].left.views}</span>
                    </button>
                  </div>
                </div>
              </div>
              {leftCardMessageClick && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-30">
                  <div className="px-6 py-8 mt-[30%] text-center bg-[rgba(0,0,0,0.5)] w-full" style={{ clipPath: "polygon(0% 50%, 100% 0%, 100% 50%, 0% 100%)" }}>
                    <p className="text-lg font-bold tracking-widest text-white rotate-[350deg]">UNAVAILABLE</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Carousel - order-1 on mobile (top), order-2 on desktop (middle) */}
          <div className="order-1 lg:order-2 w-full lg:w-auto relative" style={{ maxWidth: '100%' }}>
            {/* Left Arrow Button */}
            <button
              onClick={handlePrevious}
              className="hidden lg:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-30 border-orange-500 bg-transparent border hover:bg-orange-600 text-orange-500 hover:text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="relative flex items-center justify-center" style={{ perspective: '1200px', minHeight: '500px' }}>
              {/* Previous Previous Image - Very Small - Clickable */}
              <img
                src={carouselImages[visible.prevprev]}
                alt="Previous Previous"
                onClick={() => setCurrentIndex(visible.prevprev)}
                className="hidden lg:block absolute w-[400px] h-[500px] object-cover rounded-lg opacity-60 transition-all duration-700 cursor-pointer hover:opacity-75 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(-800px)  rotateY(45deg) scale(0.6) translateY(0)', zIndex: 0 }}
              />
              {/* Previous Image - Clickable */}
              <img
                src={carouselImages[visible.prev]}
                alt="Previous"
                onClick={() => setCurrentIndex(visible.prev)}
                className="hidden lg:block absolute 2xl:w-[550px] 2xl:h-[450px] lg:h-[300px] w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(-500px) rotateY(25deg) scale(0.8) translateY(0)', zIndex: 1 }}
              />

              {/* Current Image - Large with Shadow */}
              <img
                src={carouselImages[visible.current]}
                alt="Current"
                className={`relative w-full md:w-[500px] lg:w-[650px] 2xl:w-[700px] h-[350px] md:h-[400px] lg:h-[450px] 2xl:h-[450px] object-cover rounded-2xl transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${isAnimating ? 'carousel-scale-animate' : ''} border-8 p-2 bg-white border-[#0a3d5c]`}
                style={{ zIndex: 10, transform: 'translateY(0)' }}
              />

              {/* Next Image - Very Small - Clickable */}
              <img
                src={carouselImages[visible.next]}
                alt="Next"
                onClick={() => setCurrentIndex(visible.next)}
                className="hidden lg:block absolute 2xl:w-[550px] 2xl:h-[450px] lg:h-[300px] w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(500px) rotateY(-25deg) scale(0.8) translateY(0)', zIndex: 1 }}
              />
              {/* Next Next Image - Very Small - Clickable */}
              <img
                src={carouselImages[visible.nextnext]}
                alt="Next Next"
                onClick={() => setCurrentIndex(visible.nextnext)}
                className="hidden lg:block absolute w-[400px] h-[500px] object-cover rounded-lg opacity-60 transition-all duration-700 cursor-pointer hover:opacity-75 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(800px) rotateY(-45deg) scale(0.6) translateY(0)', zIndex: 0 }}
              />
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={handleNext}
              className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-30 bg-transparent border border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Navigation Dots + Progress Line */}
            <div className="mt-2">
              {/* Dots */}
              <div className="flex justify-center gap-2 mb-4">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-orange-500 w-8' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {/* Mobile-only navigation buttons */}
              <div className="flex lg:hidden gap-4 justify-center mb-4">
                <button
                  onClick={handlePrevious}
                  className="border-orange-500 bg-transparent border hover:bg-orange-600 text-orange-500 hover:text-white p-2 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-transparent border border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white p-2 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Progress track representing current position */}
              <div className="relative h-2 shadow-md rounded-full mx-auto w-2/3">
                {/* filled portion */}
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full"
                  style={{ width: `${progress}%`, transition: 'width 600ms ease' }}
                />

                {/* little orange thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-2 bg-orange-500 rounded-sm shadow-lg"
                  style={{ left: `calc(${progress}% - 8px)`, transition: 'left 600ms ease' }}
                />
              </div>
              {/* subtle drop shadow under the progress track (visual only) */}
              <div className="mx-auto w-2/3 mt-2 pointer-events-none">
                <div className="w-full h-2 rounded-full bg-transparent shadow-[0_18px_40px_rgba(0,0,0,0.18)]" />
              </div>

            </div>

            {/* Navigation Buttons - Below Image */}
            <div className="flex justify-center gap-4">
              <Link to="/gallery">
                <button className="px-8 py-2.5 rounded-full border-2 bg-[#0a3d5c] text-white  font-semibold hover:bg-white hover:text-[#0a3d5c] hover:border-[#0a3d5c] transition-all duration-200 shadow-sm hover:shadow-md">
                  Innovation
                </button>
              </Link>
              <Link to="/investors">
                <button className="px-8 py-2.5 rounded-full border-2 border-[#0a3d5c] text-[#0a3d5c] font-semibold hover:bg-[#0a3d5c] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md">
                  Investor
                </button>
              </Link>
            </div>
          </div>

          {/* Right Card - Investor Profile */}
          <div className="order-3 w-full md:w-96 lg:w-[350px]">
            <Card className={`w-full bg-white shadow-xl hover:shadow-2xl transition-all rounded-2xl overflow-hidden ${isAnimating ? 'carousel-animate-left' : ''}`}>
              {/* Red header area */}
              <div className="h-32 lg:h-36 relative flex items-center justify-center" style={{
                backgroundImage: "url(https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424857363_3c179bbf.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center center"
              }}>
                <div className="text-white font-bold text-2xl lg:text-3xl tracking-wide bg-[#00000080] w-full h-full text-center py-12">{investorData[currentIndex].right.company}</div>
              </div>

              {/* Avatar overlapping */}
              <div className="relative pb-5 px-6 bg-white">
                <div className="absolute -top-14 left-4 flex h-36">
                  <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-[#0a3d5c] shadow-md bg-white">
                    <img src={investorData[currentIndex].right.avatar} alt={investorData[currentIndex].right.name} className="w-full h-full object-cover" />
                  </div>
                  <div className='flex flex-col justify-end h-36'>
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1">{investorData[currentIndex].right.name}</h3>
                    <div className='flex w-full justify-center items-center gap-1'>
                      <div className="text-sm lg:text-base text-gray-500 mb-2">{investorData[currentIndex].right.location}</div>
                      <img src='/assets/flags/JP.png' className='w-8 h-6' />
                    </div>
                  </div>
                </div>

                <div className="pt-28 text-center">
                  <div className="flex justify-center mb-3 gap-4">
                    <button className="flex-1 text-sm border-[#0a3d5c] border-2 bg-white hover:bg-[#0a3d5c] hover:text-white active:bg-[#093550] text-[#0a3d5c] font-semibold py-1.5 rounded-full shadow-sm transition-all">Message</button>
                    <button className="flex-1 text-sm border-[#0a3d5c] border-2 bg-white hover:bg-[#0a3d5c] hover:text-white active:bg-[#093550] text-[#0a3d5c] font-semibold py-1.5 rounded-full shadow-sm transition-all">View Profile</button>
                  </div>

                  <div className="text-base font-semibold text-gray-700 mb-3 uppercase">Portfolio Companies</div>
                  <div className="grid grid-cols-3 gap-3">
                    {investorData[currentIndex].right.portfolio.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-18 h-18 lg:w-20 lg:h-20 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border border-gray-200">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='text-xl font-bold mt-5'>
                    Company Description
                  </div>
                  <div className='text-base mt-1'>
                    Neuno Capital focuses on the overdose, overdose management, and elicentics of eanations, based on bromide and neurotechnology.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div >
    </section >
  );
}
