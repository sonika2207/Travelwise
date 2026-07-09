import React from 'react';

const AuthLayout = ({ children, leftTitle, leftSubtitle, destinations, showStats }) => {
  return (
    <div className="flex min-h-screen bg-bg-app">
      {/* Left Side */}
      <div className="w-[45%] bg-gradient-to-br from-[#4A90D9] via-[#4ECDC4] to-[#6BCB77] relative overflow-hidden flex flex-col items-center justify-center py-[60px] px-[48px] max-lg:hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-[100px] -right-[80px] w-[350px] h-[350px] rounded-full bg-white/10" />
        <div className="absolute -bottom-[80px] -left-[60px] w-[280px] h-[280px] rounded-full bg-white/5" />
        
        <div className="font-serif text-[36px] font-bold text-white text-center leading-[1.25] drop-shadow-[0_2px_20px_rgba(0,0,0,0.15)] relative z-10 whitespace-pre-line">
          {leftTitle}
        </div>
        
        <div className="text-[15px] text-white/80 text-center mt-2.5 relative z-10">
          {leftSubtitle}
        </div>
        
        <div className="flex flex-col gap-3 mt-8 relative z-10">
          {destinations.map((dest, i) => (
            <div key={i} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full py-2.5 px-[18px] flex items-center gap-2.5 text-white text-sm font-medium">
              <span>{dest.icon}</span> {dest.name}
            </div>
          ))}
        </div>
        
        {showStats && (
          <div className="flex gap-8 mt-10 relative z-10">
            <div className="text-center text-white">
              <div className="text-2xl font-extrabold font-serif">50k+</div>
              <div className="text-xs opacity-75 mt-0.5">Trips planned</div>
            </div>
            <div className="text-center text-white">
              <div className="text-2xl font-extrabold font-serif">120</div>
              <div className="text-xs opacity-75 mt-0.5">Countries</div>
            </div>
            <div className="text-center text-white">
              <div className="text-2xl font-extrabold font-serif">4.9★</div>
              <div className="text-xs opacity-75 mt-0.5">Rating</div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center py-[60px] px-[48px] bg-white">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
