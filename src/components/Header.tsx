import React from 'react';
import { Button } from './ui/button';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="mx-auto px-[15%] py-4">
        <div className="flex items-center justify-between">
          <img 
            src="assets/logo.png"
            alt="Pitch Invest Logo"
            className="h-10 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:text-[#0a3d5c] font-medium"
              onClick={() => console.log('Login clicked')}
            >
              Login
            </Button>
            <Button 
              className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white font-medium px-6"
              onClick={() => console.log('Sign up clicked')}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

