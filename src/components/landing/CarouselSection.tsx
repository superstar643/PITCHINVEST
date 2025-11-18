import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ThumbsUp, Eye } from 'lucide-react';

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
    left: {
      avatar: 'assets/1.avif',
      company: 'NeuroLink Dynamics',
      name: 'Prof. Hiroshi Tanaka',
      location: 'Tokyo, Japan',
      startup: 'BrainTech Solutions',
      percentage: '25%',
      amount: '500,000¥',
      portfolioImage: 'https://via.placeholder.com/280/128?text=BrainTech',
      commission: '0%',
      approval: '94.5%',
      likes: 890,
      views: 2200
    },
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
    left: {
      avatar: 'assets/3.avif',
      company: 'TechVenture Inc',
      name: 'Dr. Sarah Chen',
      location: 'Singapore',
      startup: 'AI Solutions Ltd',
      percentage: '30%',
      amount: '750,000$',
      portfolioImage: 'https://via.placeholder.com/280/128?text=AI+Solutions',
      commission: '0%',
      approval: '89.1%',
      likes: 720,
      views: 1800
    },
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
    left: {
      avatar: 'assets/5.avif',
      company: 'European Fund',
      name: 'Prof. Klaus Mueller',
      location: 'Berlin, Germany',
      startup: 'Green Energy Tech',
      percentage: '20%',
      amount: '600,000€',
      portfolioImage: 'https://via.placeholder.com/280/128?text=Green+Energy',
      commission: '0%',
      approval: '91.2%',
      likes: 610,
      views: 1420
    },
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
    left: {
      avatar: 'assets/1.avif',
      company: 'American Growth',
      name: 'David Johnson',
      location: 'San Francisco, USA',
      startup: 'Quantum Computing Co',
      percentage: '35%',
      amount: '1,200,000$',
      portfolioImage: 'https://via.placeholder.com/280/128?text=Quantum',
      commission: '0%',
      approval: '87.0%',
      likes: 1040,
      views: 3050
    },
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
    left: {
      avatar: 'assets/3.avif',
      company: 'Global Innovation',
      name: 'Dr. Ravi Patel',
      location: 'Mumbai, India',
      startup: 'FinTech Solutions',
      percentage: '28%',
      amount: '400,000₹',
      portfolioImage: 'https://via.placeholder.com/280/128?text=FinTech',
      commission: '0%',
      approval: '92.3%',
      likes: 540,
      views: 1210
    },
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    <section className="py-10 md:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto px-4 md:px-8 lg:px-32 w-full">
        {/* Desktop: horizontal layout (left card, carousel, right card) */}
        {/* Mobile: vertical layout (carousel on top, cards below) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-8">
          {/* Left Card - visible on desktop, moves below on mobile */}
          <div className="order-2 lg:order-1 w-full md:w-80 z-20">
            <Card className={`w-full bg-white rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${isAnimating ? 'carousel-animate-right' : ''}`}>
            {/* Header with background and top-right badge */}
            <div className="relative h-20" style={{ backgroundImage: `url(${investorData[currentIndex].left.portfolioImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {/* small circular badge (top-right) */}
              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow" style={{ border: '4px solid rgba(255,255,255,0.9)' }}>
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                </div>
              </div>

              {/* overlapping avatar (left) */}
              <div className="absolute -bottom-10 left-4">
                <img src={investorData[currentIndex].left.avatar} alt={investorData[currentIndex].left.name} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md" />
              </div>
            </div>

            <div className="pt-12 px-5 pb-5 bg-white">
              {/* Company / top-right label */}
              <div className="text-right text-sm font-semibold text-slate-800 mb-2">{investorData[currentIndex].left.company}</div>

              {/* Info list */}
              <div className="text-sm mb-3 space-y-1">
                <div><span className="font-semibold">Nome:</span> <span className="text-slate-700">{investorData[currentIndex].left.name}</span></div>
                <div><span className="font-semibold">Startup:</span> <span className="text-slate-700">{investorData[currentIndex].left.startup}</span></div>
                {/* split location into city and country if possible */}
                {(() => {
                  const loc = investorData[currentIndex].left.location || '';
                  const parts = loc.split(',').map(p => p.trim());
                  const city = parts[0] || '';
                  const country = parts[1] || parts[0] || '';
                  return (
                    <>
                      <div><span className="font-semibold">Cidade:</span> <span className="text-slate-700">{city}</span></div>
                      <div className="flex items-center gap-2"><span className="font-semibold">País:</span> <span className="text-slate-700">{country}</span> <span className="text-xs text-gray-400">{country ? country.slice(0, 2).toUpperCase() : ''}</span></div>
                    </>
                  );
                })()}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mb-4">
                <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-md">Message</button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md">Invest</button>
              </div>

              {/* Percentage and commission */}
              <div className="text-center mb-3">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{investorData[currentIndex].left.percentage} por {investorData[currentIndex].left.amount}</div>
                <div className="text-sm text-green-600 font-semibold">{investorData[currentIndex].left.commission ?? '0%'} Comissão</div>
              </div>

              {/* Two product images */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <img src={investorData[currentIndex].left.portfolioImage} alt="Product 1" className="w-full h-20 object-cover rounded-lg shadow-sm bg-gray-100" />
                <img src={investorData[currentIndex].left.portfolioImage} alt="Product 2" className="w-full h-20 object-cover rounded-lg shadow-sm bg-gray-100" />
              </div>

              {/* Product description buttons (4) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button className="border border-gray-200 py-2 rounded text-xs">PITCH</button>
                <button className="border border-gray-200 py-2 rounded text-xs">TECHNICAL SHEET</button>
                <button className="border border-gray-200 py-2 rounded text-xs">TECHNICAL SHEET</button>
                <button className="border border-gray-200 py-2 rounded text-xs">FACT SHEET</button>
              </div>

              {/* Public approval box */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-center text-xs text-gray-500 mb-2">PUBLIC APPROVAL</div>
                <div className="text-center text-2xl font-extrabold text-green-600 mb-2">{investorData[currentIndex].left.approval ?? '—'}</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ThumbsUp size={16} />
                    <span>{investorData[currentIndex].left.likes ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye size={16} />
                    <span>{investorData[currentIndex].left.views ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
            </Card>
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
                className="hidden lg:block absolute w-[400px] h-[340px] object-cover rounded-lg opacity-60 transition-all duration-700 cursor-pointer hover:opacity-75 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(-540px) rotateY(25deg) scale(0.6) translateY(0)', zIndex: 0 }}
              />
              {/* Previous Image - Clickable */}
              <img
                src={carouselImages[visible.prev]}
                alt="Previous"
                onClick={() => setCurrentIndex(visible.prev)}
                className="hidden lg:block absolute w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(-240px) rotateY(25deg) scale(0.8) translateY(0)', zIndex: 1 }}
              />

              {/* Current Image - Large with Shadow */}
              <img
                src={carouselImages[visible.current]}
                alt="Current"
                className={`relative w-full md:w-[600px] lg:w-[700px] h-[250px] md:h-[350px] lg:h-[400px] object-cover rounded-2xl transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${isAnimating ? 'carousel-scale-animate' : ''} border-8 p-2 bg-white border-[#0a3d5c]`}
                style={{ zIndex: 10, transform: 'translateY(0)' }}
              />

              {/* Next Image - Very Small - Clickable */}
              <img
                src={carouselImages[visible.next]}
                alt="Next"
                onClick={() => setCurrentIndex(visible.next)}
                className="hidden lg:block absolute w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(240px) rotateY(-25deg) scale(0.8) translateY(0)', zIndex: 1 }}
              />
              {/* Next Next Image - Very Small - Clickable */}
              <img
                src={carouselImages[visible.nextnext]}
                alt="Next Next"
                onClick={() => setCurrentIndex(visible.nextnext)}
                className="hidden lg:block absolute w-[400px] h-[340px] object-cover rounded-lg opacity-60 transition-all duration-700 cursor-pointer hover:opacity-75 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(540px) rotateY(-25deg) scale(0.6) translateY(0)', zIndex: 0 }}
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
            <div className="mt-6">
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
          </div>

          {/* Right Card - Investor Profile */}
          <div className="order-3 w-full md:w-80">
            <Card className={`w-full bg-white shadow-xl hover:shadow-2xl transition-all rounded-2xl overflow-hidden ${isAnimating ? 'carousel-animate-left' : ''}`}>
            {/* Red header area */}
            <div className="h-32 bg-gradient-to-r from-red-600 to-red-500 relative flex items-center justify-center">
              <div className="text-white font-bold text-lg tracking-wide">{investorData[currentIndex].right.company}</div>
            </div>

            {/* Avatar overlapping */}
            <div className="relative pb-6 px-6 bg-white">
              <div className="absolute -top-12 left-16 -translate-x-1/2">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-300 shadow-md bg-white">
                  <img src={investorData[currentIndex].right.avatar} alt={investorData[currentIndex].right.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="pt-16 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-1">{investorData[currentIndex].right.name}</h3>
                <div className="text-sm text-gray-500 mb-4">{investorData[currentIndex].right.location}</div>

                <div className="flex justify-center mb-6">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-full shadow-sm transition-all">Message</button>
                </div>

                <div className="text-sm font-semibold text-gray-700 mb-3 uppercase">Portfolio Companies</div>
                <div className="grid grid-cols-3 gap-3">
                  {investorData[currentIndex].right.portfolio.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border border-gray-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center leading-tight">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
