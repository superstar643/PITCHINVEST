import React from 'react';
import { Heart } from 'lucide-react';
import { galleryItems } from '@/lib/galleryData';

const featuredInnovations = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    label: 'LIVE AUCTION',
    category: 'MEDICAL TECH',
    likes: 1247,
    title: 'AI Diagnostic System',
    description: 'Revolutionary AI-powered diagnostic tool for early disease detection with 99.8% accuracy',
    author: 'Dr. Sarah Chen',
    location: 'Berlin, Germany',
    target: '€4.2M',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop',
    label: 'NEW',
    category: 'CLEAN ENERGY',
    likes: 892,
    title: 'Solar Glass Technology',
    description: 'Transparent solar panels integrated into architectural glass for sustainable buildings',
    author: 'João Silva',
    location: 'Lisbon, Portugal',
    target: '€2.8M',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    label: 'TRENDING',
    category: 'ROBOTICS',
    likes: 2103,
    title: 'Autonomous Surgery Robot',
    description: 'Precision surgical robot with AI-guided operations for minimally invasive procedures',
    author: 'Dr. Marie Laurent',
    location: 'Paris, France',
    target: '€6.5M',
  },
];

const FeaturedInnovationsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Innovations
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Discover groundbreaking projects seeking investment
          </p>
        </div>

        {/* Innovation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featuredInnovations.map((innovation) => (
            <div
              key={innovation.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={innovation.image}
                  alt={innovation.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#0a3d5c] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {innovation.label}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                  <Heart className="w-4 h-4 text-[#0a3d5c] fill-[#0a3d5c]" />
                  <span className="text-sm font-semibold text-gray-900">
                    {innovation.likes.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-[#0a3d5c] uppercase tracking-wide">
                    {innovation.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {innovation.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {innovation.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{innovation.author}</p>
                    <p className="text-xs text-gray-500">{innovation.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#0a3d5c]">{innovation.target}</p>
                    <p className="text-xs text-gray-500 uppercase">TARGET</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInnovationsSection;

