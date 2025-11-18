import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

const carouselImages = [
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424373352_9e70bd44.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424375333_ada89fa6.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424377234_349ea0c2.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424379240_e4343003.webp',
  'https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763424381216_4ccb077e.webp',
];


export default function CarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getVisibleImages = () => {
    const prev = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
    const next = (currentIndex + 1) % carouselImages.length;
    return { prev, current: currentIndex, next };
  };

  const visible = getVisibleImages();

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8">
          {/* Left Card - Innovation Hub */}
          <Card className="w-64 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Innovation Hub</h3>
              <p className="text-slate-600">Cutting-edge technology solutions</p>
            </div>
          </Card>

          {/* Center Carousel */}
          <div className="relative w-[600px]">
            <div className="relative h-[400px] flex items-center justify-center" style={{ perspective: '1200px' }}>
              {/* Previous Image - Very Small */}
              <img
                src={carouselImages[visible.prev]}
                alt="Previous"
                className="absolute w-32 h-20 object-cover rounded-lg opacity-20 transition-all duration-700"
                style={{ transform: 'translateX(-280px) rotateY(25deg) scale(0.4)', zIndex: 1 }}
              />
              
              {/* Current Image - Large with Shadow */}
              <img
                src={carouselImages[visible.current]}
                alt="Current"
                className="relative w-[500px] h-[300px] object-cover rounded-2xl transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                style={{ zIndex: 10 }}
              />
              
              {/* Next Image - Very Small */}
              <img
                src={carouselImages[visible.next]}
                alt="Next"
                className="absolute w-32 h-20 object-cover rounded-lg opacity-20 transition-all duration-700"
                style={{ transform: 'translateX(280px) rotateY(-25deg) scale(0.4)', zIndex: 1 }}
              />
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-orange-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Card - Global Reach */}
          <Card className="w-64 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Global Reach</h3>
              <p className="text-slate-600">Worldwide investment opportunities</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
