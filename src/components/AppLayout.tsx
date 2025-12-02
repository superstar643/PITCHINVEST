import React from 'react';
import Header from './Header';
import HeroSection from './landing/HeroSection';
import JourneySection from './landing/JourneySection';
import StatisticsSection from './landing/StatisticsSection';
import CarouselSection from './landing/CarouselSection';
import ArticlesSection from './landing/ArticlesSection';
import FeaturedInnovationsSection from './landing/FeaturedInnovationsSection';
import SuccessStoriesSection from './landing/SuccessStoriesSection';
import UsersSection from './landing/UsersSection';
import Footer from './Footer';


interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col custom-scrollbar">
      <Header />
      <main className="flex-1">
        {children ? children : <><HeroSection /><CarouselSection /><UsersSection /></>}
      </main>
      <Footer />
    </div>
  );
};



export default AppLayout;
