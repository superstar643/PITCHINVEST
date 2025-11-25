import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="hero-section" className="relative min-h-screen flex flex-col w-full">
      {/* Image Section - responsive height */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[400px] md:min-h-[600px] lg:h-auto lg:flex-1">
        <img
          src="assets/hero-back.png"
          alt="Pitch Invest World Map"
          className="absolute inset-0 w-full h-full object-fill"
        />
        <div className='flex flex-col absolute w-full h-full'>
          {/* Logo Section */}
          <div className='flex items-center justify-center flex-1 pt-4 md:pt-12'>
            <img 
              src="assets/hero-logo1.png" 
              alt="Hero Front" 
              className="relative z-10 w-32 h-32 md:w-64 md:h-64 lg:w-80 lg:h-80" 
            />
          </div>
          
          {/* Hero Text Content */}
          <div className='flex justify-center items-center flex-1 pb-4 md:pb-8'>
            <div className="text-center text-white z-10 px-4">
              <p className="text-xs md:text-lg lg:text-2xl font-light tracking-wide mb-2 md:mb-3">Welcome to</p>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-6">PITCH INVEST</h1>
              <p className="text-sm md:text-xl lg:text-3xl font-light leading-tight md:leading-normal">
                The future of your investments<br />
                Starts Here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Section - responsive padding and layout */}
      <div className="bg-gray-50 py-6 md:py-10 lg:py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Investment Platforms */}
            <div className="text-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 mb-6 md:mb-0">
              <div className="flex justify-center mb-3 md:mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763423265145_c838b1b2.webp" alt="Investment Platforms" className="w-10 h-10 md:w-16 md:h-16" />
              </div>
              <h3 className="text-sm md:text-xl font-bold text-gray-800 mb-1 md:mb-2">INVESTMENT PLATFORMS</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Explore diverse investment opportunities and grow your portfolio</p>
            </div>

            {/* Expert Advice */}
            <div className="text-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 mb-6 md:mb-0">
              <div className="flex justify-center mb-3 md:mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763423266046_377d631d.webp" alt="Expert Advice" className="w-10 h-10 md:w-16 md:h-16" />
              </div>
              <h3 className="text-sm md:text-xl font-bold text-gray-800 mb-1 md:mb-2">EXPERT ADVICE</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Get guidance from seasoned investors and industry professionals</p>
            </div>

            {/* Market Insights */}
            <div className="text-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 mb-6 md:mb-0">
              <div className="flex justify-center mb-3 md:mb-4">
                <img src="https://d64gsuwffb70l.cloudfront.net/691bae6041555f05a5561a30_1763423266916_77e3f42b.webp" alt="Market Insights" className="w-10 h-10 md:w-16 md:h-16" />
              </div>
              <h3 className="text-sm md:text-xl font-bold text-gray-800 mb-1 md:mb-2">MARKET INSIGHTS</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Stay informed with real-time market data and analytics</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
