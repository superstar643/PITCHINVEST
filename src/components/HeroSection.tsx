import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="hero-section" className="relative h-screen flex flex-col">
      {/* Image Section - Takes up about 70% of viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68e6db9c514e82404b06d2a1_1763423144402_8c424314.png"
          alt="Pitch Invest World Map"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Left Advertisement Space */}
        <div className="absolute left-8 top-1/4 text-white text-xl md:text-2xl font-light max-w-xs">
          <p className="leading-relaxed">space for<br />advertisements<br />and promotions</p>
        </div>

        {/* Right Advertisement Space */}
        <div className="absolute right-8 top-1/4 text-white text-xl md:text-2xl font-light max-w-xs text-right">
          <p className="leading-relaxed">space for<br />advertisements<br />and promotions</p>
        </div>
      </div>

      {/* Bottom Features Section - Takes up about 30% */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Investment Platforms */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763423265145_c838b1b2.webp" alt="Investment Platforms" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">INVESTMENT PLATFORMS</h3>
              <p className="text-gray-600 text-sm">Explore diverse investment opportunities and grow your portfolio</p>
            </div>

            {/* Expert Advice */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763423266046_377d631d.webp" alt="Expert Advice" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">EXPERT ADVICE</h3>
              <p className="text-gray-600 text-sm">Get guidance from seasoned investors and industry professionals</p>
            </div>

            {/* Market Insights */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763423266916_77e3f42b.webp" alt="Market Insights" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">MARKET INSIGHTS</h3>
              <p className="text-gray-600 text-sm">Stay informed with real-time market data and analytics</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
