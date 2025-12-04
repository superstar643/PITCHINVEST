import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-[#0a3d5c]">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="flex flex-col gap-2">
              <Link to="/gallery" onClick={onClose}>
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-[#0a3d5c] hover:bg-[#0a3d5c]/10 font-medium text-base py-6"
                >
                  Gallery
                </Button>
              </Link>
              <Link to="/investors" onClick={onClose}>
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-[#0a3d5c] hover:bg-[#0a3d5c]/10 font-medium text-base py-6"
                >
                  Investors
                </Button>
              </Link>
              <Link to="/blog" onClick={onClose}>
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-[#0a3d5c] hover:bg-[#0a3d5c]/10 font-medium text-base py-6"
                >
                  Blog
                </Button>
              </Link>
              <Link to="/contact" onClick={onClose}>
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-[#0a3d5c] hover:bg-[#0a3d5c]/10 font-medium text-base py-6"
                >
                  Contact
                </Button>
              </Link>
            </nav>
          </div>

          {/* Language Selector */}
          <div className="p-6 border-t">
            <div className="mb-2 text-sm font-medium text-gray-600">Language</div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

