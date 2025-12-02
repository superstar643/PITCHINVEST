import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search, Menu } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import Sidebar from './Sidebar';

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="mx-auto px-[15%] py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/assets/logo1.png"
              alt="Pitch Invest Logo"
              className="h-10 cursor-pointer"
              onClick={() => window.location.href = '/'}
            />
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                size="icon"
                className="text-[#0a3d5c] hover:bg-[#0a3d5c]/10"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <LanguageSelector />
              
              <Button 
                variant="ghost"
                size="icon"
                className="text-[#0a3d5c] hover:bg-[#0a3d5c]/10"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Header;

