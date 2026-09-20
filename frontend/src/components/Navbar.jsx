import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-navy-800 border-b border-navy-700 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center md:hidden">
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-4 text-xl font-bold text-cyber-blue">CyberShield</span>
      </div>
      
      <div className="hidden md:block">
        {/* Breadcrumbs or page title could go here */}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-green"></span>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
