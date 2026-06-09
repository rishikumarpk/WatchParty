import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Play } from 'lucide-react';

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-black backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-center text-white">
        <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Play size={18} fill="currentColor" />
              </div>
              WatchTogether
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium">How to Use</button>
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium">About Us</button>
            </div>
          </div>
          <div className="hidden md:flex">
            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors font-medium shadow-sm shadow-primary/50">
              Sign in / Sign up
            </Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full bg-white border-b border-gray-100 z-40 p-4 flex flex-col gap-4 shadow-lg">
          <button className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-left">How to Use</button>
          <button className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-left">About Us</button>
          <Link to="/login" className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors font-medium text-center">
            Sign in / Sign up
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full h-screen relative flex items-center justify-center bg-black group overflow-hidden">
          <img 
            src="/background.jpg" 
            alt="Watch Party Background" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 transition-all duration-700 group-hover:bg-black/40"></div>
          
          <h1 className="relative z-10 text-white text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter hover:scale-110 hover:text-primary transition-all duration-500 cursor-default select-none drop-shadow-2xl">
            WatchTogether
          </h1>
        </div>
      </main>
    </div>
  );
};

export default Home;
