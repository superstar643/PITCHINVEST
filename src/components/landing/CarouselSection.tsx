import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ThumbsUp, Eye } from 'lucide-react';
import UserCard from '@/components/landing/UserCard';
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
      <div className="mx-auto px-4 md:px-8 2xl:px-32 lg:px-12 w-full">
        {/* Desktop: horizontal layout (left card, carousel, right card) */}
        {/* Mobile: vertical layout (carousel on top, cards below) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-8">
          {/* Left Card - visible on desktop, moves below on mobile */}
          <div className="order-2 lg:order-1 w-full md:w-80 z-20">
            <UserCard key={investorData[currentIndex].left.id} id={investorData[currentIndex].left.id} {...investorData[currentIndex].left} />
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
                className="hidden lg:block absolute 2xl:w-[550px] 2xl:h-[300px] lg:h-[300px] w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
                style={{ transform: 'translateX(-240px) rotateY(25deg) scale(0.8) translateY(0)', zIndex: 1 }}
              />

              {/* Current Image - Large with Shadow */}
              <img
                src={carouselImages[visible.current]}
                alt="Current"
                className={`relative w-full md:w-[400px] lg:w-[500px] 2xl:w-[700px] h-[250px] md:h-[250px] lg:h-[300px] 2xl:h-[400px] object-cover rounded-2xl transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${isAnimating ? 'carousel-scale-animate' : ''} border-8 p-2 bg-white border-[#0a3d5c]`}
                style={{ zIndex: 10, transform: 'translateY(0)' }}
              />

              {/* Next Image - Very Small - Clickable */}
              <img
                src={carouselImages[visible.next]}
                alt="Next"
                onClick={() => setCurrentIndex(visible.next)}
                className="hidden lg:block absolute 2xl:w-[550px] 2xl:h-[300px] lg:h-[300px] w-[550px] h-[350px] object-cover rounded-lg opacity-80 transition-all duration-700 cursor-pointer hover:opacity-100 border-8 p-2 bg-white border-[#0a3d5c]"
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
              <div className="h-32 relative flex items-center justify-center" style={{
                backgroundImage: "url(https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424857363_3c179bbf.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center center"
              }}>
                <div className="text-white font-bold text-2xl tracking-wide bg-[#00000080] w-full h-full text-center py-10">{investorData[currentIndex].right.company}</div>
              </div>

              {/* Avatar overlapping */}
              <div className="relative pb-4 px-6 bg-white">
                <div className="absolute -top-12 left-16 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#0a3d5c] shadow-md bg-white">
                    <img src={investorData[currentIndex].right.avatar} alt={investorData[currentIndex].right.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="pt-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{investorData[currentIndex].right.name}</h3>
                  <div className='flex w-full justify-center'>
                    <div className="text-sm text-gray-500 mb-2">{investorData[currentIndex].right.location}</div>
                    <img src='/assets/flags/JP.png' className='w-8 h-6' />
                  </div>

                  <div className="flex justify-center mb-2 gap-4">
                    <button className="flex-1 text-xs border-[#0a3d5c] border-2 bg-white hover:bg-[#0a3d5c] hover:text-white active:bg-[#093550] text-[#0a3d5c] font-semibold py-1 rounded-full shadow-sm transition-all">Message</button>
                    <button className="flex-1 text-xs border-[#0a3d5c] border-2 bg-white hover:bg-[#0a3d5c] hover:text-white active:bg-[#093550] text-[#0a3d5c] font-semibold py-1 rounded-full shadow-sm transition-all">View Profile</button>
                  </div>

                  <div className="text-sm font-semibold text-gray-700 mb-2 uppercase">Portfolio Companies</div>
                  <div className="grid grid-cols-3 gap-2">
                    {investorData[currentIndex].right.portfolio.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border border-gray-200">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='text-lg font-bold mt-4'>
                    Company Description
                  </div>
                  <div className='text-sm'>
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
