import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="mx-auto px-[15%] py-4">
        <div className="flex items-center justify-between">
          <img 
            src="/assets/logo1.png"
            alt="Pitch Invest Logo"
            className="h-10 cursor-pointer"
            onClick={() => window.location.href = '/'}
          />
          
          <div className="flex items-center gap-4">
            <Link to="/gallery">
              <Button 
                variant="ghost"
                className="text-[#0a3d5c] hover:bg-[#0a3d5c]/10 font-medium"
              >
                Gallery
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-[#0a3d5c] font-medium"
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white font-medium px-6"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

