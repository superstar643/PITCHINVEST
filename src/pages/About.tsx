import React from 'react';
import { 
  Lightbulb, 
  Users, 
  Rocket, 
  Award,
  Globe,
  Zap,
  Star,
  TrendingUp,
  Search,
  Brain,
  Gavel,
  Heart,
  CheckCircle,
  Shield,
  Headphones,
  MapPin
} from 'lucide-react';

const About: React.FC = () => {
  const missionFeatures = [
    { icon: Lightbulb, title: 'Innovation', subtitle: 'Curated Selection' },
    { icon: Users, title: 'Connection', subtitle: 'Elite Network' },
    { icon: Rocket, title: 'Acceleration', subtitle: 'Fast Growth' },
    { icon: Award, title: 'Excellence', subtitle: 'Quality First' },
  ];

  const stats = [
    { value: '10K+', label: 'PROJECTS' },
    { value: '5K+', label: 'INVESTORS' },
    { value: '€200M+', label: 'FUNDED' },
  ];

  const visionCards = [
    { icon: Globe, title: 'Global Innovation', description: 'Become the world\'s most trusted platform for deep tech innovation' },
    { icon: Zap, title: 'Transformation', description: 'Accelerate the journey from idea to market-ready innovation' },
    { icon: Star, title: 'Premium Experience', description: 'Maintain the highest standards of quality and careful curation' },
    { icon: TrendingUp, title: 'Impact', description: 'Drive meaningful change through breakthrough technologies' },
  ];

  const platformStats = [
    { value: '100%', label: 'VALIDATED' },
    { value: 'AI-Powered', label: 'MATCHING' },
    { value: 'Transparent', label: 'AUCTIONS' },
  ];

  const howItWorks = [
    { icon: Search, title: 'Expert Validation', description: 'Every innovation undergoes rigorous vetting by industry experts to ensure quality and feasibility', color: '#0a3d5c' },
    { icon: Brain, title: 'Smart Matching', description: 'AI-powered matching connects inventors with the most relevant investors for their field', color: '#22c55e' },
    { icon: Gavel, title: 'Transparent Auctions', description: 'Fair, competitive bidding system where the best innovations find their ideal funding partners', color: '#eab308' },
    { icon: Heart, title: 'Elite Network', description: 'Curated community of verified investors, mentors, and industry leaders', color: '#ef4444' },
  ];

  const whyPitchInvest = [
    { icon: CheckCircle, title: 'Curated Excellence', description: 'Not just another marketplace. We hand-select innovations with real potential, ensuring every project meets our high standards for feasibility and impact.' },
    { icon: Shield, title: 'Transparent & Fair', description: 'Our auction system creates competitive bidding, ensuring fair market value while giving investors full visibility into the investment process.' },
    { icon: Headphones, title: 'End-to-End Support', description: 'From validation to funding to scaling, we provide comprehensive support throughout your innovation journey.' },
  ];

  const teamMembers = [
    { name: 'Dr. Sarah Chen', role: 'CEO & CO-FOUNDER', location: 'Berlin, Germany', avatar: '/assets/1.avif', description: 'Serial entrepreneur with 15+ years in venture capital and deep tech investments.', tags: ['MEDTECH', 'FINTECH', 'AI'] },
    { name: 'Michael Chen', role: 'CTO & CO-FOUNDER', location: 'San Francisco, USA', avatar: '/assets/2.avif', description: 'Former tech lead at Google, passionate about bridging innovation and technology.', tags: ['AI/ML', 'PLATFORM', 'WEB3 FINTECH'] },
    { name: 'Dr. Emma Watson', role: 'CHIEF INNOVATION OFFICER', location: 'London, UK', avatar: '/assets/3.avif', description: 'PhD in Engineering, helped launch 50+ companies to market.', tags: ['R&D', 'IP'] },
    { name: 'Alexandre Laurent', role: 'HEAD OF INVESTOR RELATIONS', location: 'Paris, France', avatar: '/assets/4.avif', description: 'Connects the world\'s best innovations with elite investors and VCs.', tags: ['INVESTMENT', 'NETWORKS', 'CONTACTS'] },
    { name: 'Sofia Martinez', role: 'VP OF PRODUCT', location: 'Barcelona, Spain', avatar: '/assets/5.avif', description: 'Designer turned entrepreneur, obsessed with user experience and platform excellence.', tags: ['UX/UI', 'PRODUCT', 'DESIGN'] },
    { name: 'Dr. Marie Laurent', role: 'HEAD OF PLATFORM OPERATIONS', location: 'Paris, France', avatar: '/assets/6.avif', description: 'Expert in scaling platforms and managing complex technical ecosystems.', tags: ['OPS', 'SCALING', 'TECH'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#d5b775] font-semibold tracking-widest text-sm uppercase">
              Our Mission
            </span>
            <p className="text-gray-700 mt-4 leading-relaxed">
              Our mission is to create a premium platform where groundbreaking innovations meet visionary investors. We bridge the gap between inventors and investors, fostering a community dedicated to bringing transformative ideas to life.
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed text-sm">
              We believe that every revolutionary idea deserves the right platform and the right partners. By providing expert validation, transparent auctions, and a curated network of elite investors, we ensure that innovation reaches its full potential.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[#0a3d5c]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Validated by Experts</span>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {missionFeatures.map((feature) => (
                <div key={feature.title} className="bg-white rounded-xl p-4 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all">
                  <feature.icon className="w-8 h-8 text-[#d5b775] mb-2" />
                  <h4 className="font-semibold text-[#0a3d5c]">{feature.title}</h4>
                  <p className="text-xs text-gray-500">{feature.subtitle}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-[#d5b775]">{stat.value}</div>
                  <div className="text-xs text-gray-500 tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <span className="text-[#d5b775] font-semibold tracking-widest text-sm uppercase">
            Our Vision
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            <span className="text-[#0a3d5c]">Shaping the </span>
            <span className="text-[#d5b775]">Future</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            We envision a world where the most brilliant innovations seamlessly connect with the most visionary investors, creating a global ecosystem that accelerates human progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {visionCards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#d5b775]/10 flex items-center justify-center">
                <card.icon className="w-7 h-7 text-[#d5b775]" />
              </div>
              <h3 className="font-bold text-[#0a3d5c] mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-600 mb-4">
          Join us in building the future of innovation
        </div>
        <div className="flex justify-center items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#d5b775]">2024</div>
            <div className="text-xs text-gray-500 tracking-wider">FOUNDED</div>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#d5b775]">2026</div>
            <div className="text-xs text-gray-500 tracking-wider">VISION</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <span className="text-[#d5b775] font-semibold tracking-widest text-sm uppercase">
            Platform Concept
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            <span className="text-[#0a3d5c]">How Pitch Invest </span>
            <span className="text-[#d5b775]">Works</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Pitch Invest is the premier platform connecting groundbreaking innovations with visionary investors. Our unique approach combines expert validation, smart matching, and transparent auctions to create meaningful partnerships that drive innovation forward.
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-10">
          {platformStats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg font-bold text-[#d5b775]">{stat.value}</div>
              <div className="text-xs text-gray-500 tracking-wider">{stat.label}</div>
              {index < platformStats.length - 1 && <div className="hidden md:block"></div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {howItWorks.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="w-7 h-7" style={{ color: item.color }} />
              </div>
              <h3 className="font-bold text-[#0a3d5c] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Pitch Invest Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-[#faf9f6] rounded-3xl p-8 flex items-center justify-center">
            <div className="flex gap-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-[#d5b775]/20 flex items-center justify-center">
                  <Lightbulb className="w-10 h-10 text-[#d5b775]" />
                </div>
                <div className="font-bold text-[#0a3d5c]">Deep Tech</div>
                <div className="text-xs text-gray-500">Focus</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-[#d5b775]/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-[#d5b775]" />
                </div>
                <div className="font-bold text-[#0a3d5c]">Elite</div>
                <div className="text-xs text-gray-500">Quality</div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-[#0a3d5c]">Why </span>
              <span className="text-[#d5b775]">Pitch Invest?</span>
            </h2>
            <div className="space-y-6">
              {whyPitchInvest.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#d5b775]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a3d5c] mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[#d5b775] font-semibold tracking-widest text-sm uppercase">
            Our Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            <span className="text-[#0a3d5c]">Meet the </span>
            <span className="text-[#d5b775]">Experts</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            A diverse team of visionaries, technologists, and entrepreneurs dedicated to transforming how innovation meets investment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all">
              <div className="flex items-start gap-4 mb-4">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#d5b775]"
                />
                <div>
                  <h3 className="font-bold text-[#0a3d5c]">{member.name}</h3>
                  <p className="text-xs text-[#d5b775] font-semibold tracking-wide">{member.role}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    {member.location}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{member.description}</p>
              <div className="flex flex-wrap gap-2">
                {member.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-[#0a3d5c]/10 text-[#0a3d5c] text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;

