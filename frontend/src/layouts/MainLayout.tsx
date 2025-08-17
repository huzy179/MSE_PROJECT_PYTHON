import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <Header />

      <main className="flex-1 flex flex-col relative z-10">
        <div className="container mx-auto px-4 py-12 flex-1">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 min-h-[60vh]">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
