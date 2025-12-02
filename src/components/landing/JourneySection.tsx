import React from 'react';

const journeySteps = [
  {
    number: '01',
    title: 'Submit Your Innovation',
    description: 'Share your groundbreaking idea with our expert review panel. Upload comprehensive documentation, technical specifications, and proof of concept to begin your journey.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    hasNextStep: true,
  },
  {
    number: '02',
    title: 'Expert Validation',
    description: 'Our specialized team evaluates your innovation for market potential, technical feasibility, and investment readiness. Receive professional feedback and optimization strategies.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    hasNextStep: true,
  },
  {
    number: '03',
    title: 'Connect with Investors',
    description: 'Get matched with qualified investors aligned with your innovation sector. Participate in exclusive pitch sessions and networking opportunities.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    hasNextStep: true,
  },
  {
    number: '04',
    title: 'Secure Funding',
    description: 'Navigate negotiations with professional support. Structure deals that benefit both innovators and investors, ensuring sustainable growth for your project.',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
    hasNextStep: true,
  }
];

const JourneySection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Your Journey to <span className="text-[#0a3d5c]">Success</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your innovation into investment opportunity through our proven process.
          </p>
        </div>

        {/* Steps Grid - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {journeySteps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-start gap-6 md:gap-8`}
            >
              {/* Image */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="text-5xl md:text-6xl font-bold text-gray-200 mb-2">
                  {step.number}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                  {step.description}
                </p>
                {step.hasNextStep && (
                  <div className="flex items-center gap-2 text-[#0a3d5c] font-medium mt-auto">
                    <span className="w-2 h-2 rounded-full bg-[#0a3d5c]"></span>
                    <span className="text-xs md:text-sm uppercase tracking-wide">NEXT STEP</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;

