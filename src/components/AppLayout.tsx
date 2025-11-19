import React from 'react';
import Header from './Header';
import HeroSection from './landing/HeroSection';
import CarouselSection from './landing/CarouselSection';
import UsersSection from './landing/UsersSection';
import Footer from './Footer';


interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children ? children : <><HeroSection /><CarouselSection /><UsersSection /></>}
      </main>
      <Footer />
    </div>
  );
};



export default AppLayout;
