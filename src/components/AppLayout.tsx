import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import CarouselSection from './CarouselSection';
import UsersSection from './UsersSection';
import StatsSection from './StatsSection';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CarouselSection />
      <UsersSection />
      <StatsSection />
      <Footer />
    </div>
  );
};



export default AppLayout;
