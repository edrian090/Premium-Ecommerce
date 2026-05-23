'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // Prevent hydration mismatches on server-render
  if (!isMounted) {
    return (
      <div className="flex gap-3 text-center items-center justify-center bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-md">
        <Clock className="w-4 h-4 text-white/80 animate-spin" />
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/90">Loading Offer...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-center items-center justify-center bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-md transition-all duration-300 hover:bg-white/15">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-extrabold text-white/90">
        <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Offer Ends In:</span>
      </div>
      <div className="flex gap-1.5 font-bold text-white font-mono text-sm tracking-tight">
        <span className="bg-[#002b1c] px-2.5 py-1 rounded shadow-inner border border-[#004d34]">{formatNumber(timeLeft.hours)}h</span>:
        <span className="bg-[#002b1c] px-2.5 py-1 rounded shadow-inner border border-[#004d34]">{formatNumber(timeLeft.minutes)}m</span>:
        <span className="bg-amber-400 text-neutral-900 px-2.5 py-1 rounded shadow-md border border-amber-300 font-extrabold animate-pulse">{formatNumber(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
}
