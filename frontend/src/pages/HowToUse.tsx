import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const HowToUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-textMain font-sans relative flex flex-col">
      {/* Background Image */}
      <img 
        src="/background.jpg" 
        alt="Watch Party Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-center text-white">
        <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm shadow-primary/20">
                <Play size={18} fill="currentColor" />
              </div>
              WatchTogether
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-primary font-medium">How To Use</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-white/80 hover:text-white font-medium transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-primaryHover transition-colors font-medium shadow-sm shadow-primary/30">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-16 md:py-32 space-y-24 md:space-y-32">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mt-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            How To Use
          </h1>
          <p className="text-lg text-textMuted">
            A simple guide to creating rooms, syncing local video files, and enjoying perfectly timed playback with your friends.
          </p>
        </div>

        {/* Section 1 */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="bg-surface/80 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/10">
              <img 
                src="/image1.png" 
                alt="Create Your Account" 
                className="w-full h-auto rounded-2xl shadow-sm object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6 order-1 md:order-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-xl mb-2">
              1
            </div>
            <h2 className="text-3xl font-bold text-white">
              Create Your Account
            </h2>
            <p className="text-lg text-textMuted leading-relaxed">
              Getting started is simple. Register using your email address and receive a secure verification code. Enter the code to verify your account and log in. Once authenticated, you can start creating or joining watch parties with your friends.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 space-y-6 order-1 md:order-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-xl mb-2">
              2
            </div>
            <h2 className="text-3xl font-bold text-white">
              Choose Your Local Video and Join
            </h2>
            <p className="text-lg text-textMuted leading-relaxed">
              Unlike streaming extensions, WatchTogether lets you sync offline, local video files directly from your computer! Select the video file you want to watch from your device, and either create a new room or join an existing one. To ensure perfect synchronization, each person must select their own local copy of the same video file before joining.
            </p>
          </div>
          <div className="w-full md:w-1/2 order-2 md:order-2">
            <div className="bg-surface/80 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/10">
              <img 
                src="/image2.png" 
                alt="Choose Your Movie" 
                className="w-full h-auto rounded-2xl shadow-sm object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="bg-surface/80 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/10">
              <img 
                src="/image3.png" 
                alt="Share and Enjoy Together" 
                className="w-full h-auto rounded-2xl shadow-sm object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6 order-1 md:order-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-xl mb-2">
              3
            </div>
            <h2 className="text-3xl font-bold text-white">
              Share and Enjoy Synchronized Playback
            </h2>
            <p className="text-lg text-textMuted leading-relaxed">
              Once your room is created, share the unique room code with your friends. Everyone in the room will watch the local video together with perfectly synchronized playback, while using the built-in chatbox to communicate in real time. No streaming site subscriptions required!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowToUse;
