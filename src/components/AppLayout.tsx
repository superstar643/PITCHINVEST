import React from 'react';
import Header from './Header';
import HeroSection from './landing/HeroSection';
import CarouselSection from './landing/CarouselSection';
import UsersSection from './landing/UsersSection';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CarouselSection />
      <UsersSection />
      <Footer />
    </div>
  );
};



export default AppLayout;
