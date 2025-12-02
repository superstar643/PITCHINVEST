import React from 'react';

const successStories = [
  {
    id: 1,
    quote: 'This platform transformed my innovation into a €10M business. The support and network access were invaluable.',
    author: 'Dr. Emma Watson',
    title: 'Inventor',
    company: 'MedTech Innovations',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    quote: 'I\'ve found exceptional opportunities here and invested in 12 innovations. The quality and validation process is outstanding.',
    author: 'Michael Chen',
    title: 'Venture Capitalist',
    company: 'Future Ventures',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    quote: 'We exceeded our funding goals by 200% in just 48 hours. The investor network here is incredible.',
    author: 'Sofia Martinez',
    title: 'Eco-Entrepreneur',
    company: 'GreenPack Solutions',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
];

const SuccessStoriesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            What our innovators and investors say
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {successStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-lg shadow-md p-6 md:p-8 hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed italic">
                  "{story.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={story.avatar}
                  alt={story.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{story.author}</p>
                  <p className="text-sm text-gray-600">{story.title}</p>
                  <p className="text-sm text-[#0a3d5c] font-medium">{story.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;

