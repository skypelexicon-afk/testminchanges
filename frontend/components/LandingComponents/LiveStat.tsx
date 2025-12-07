'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  FaCheckCircle,
  FaEye,
  FaYoutube,
  FaUserGraduate,
  FaUsers,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

let socket: Socket | null = null;

type Stats = {
  totalStudents: number;
  youtubeViews: number;
  subscribers: number;
  activeUsers: number;
  issuesSolved: number;
};


function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    youtubeViews: 0,
    subscribers: 0,
    activeUsers: 0,
    issuesSolved: 4001,
  });

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/website-stats`
        );
        const data = await res.json();

        setStats((prev) => ({
          ...prev,
          totalStudents: data.totalStudents || 0,
          youtubeViews: Number(data.youtubeStats?.viewCount || 0),
          subscribers: Number(data.youtubeStats?.subscriberCount || 0),
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Live active users via socket
  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        path: '/api/active-users',
        transports: ['websocket'],
      });
    }

    socket.on('activeUsers', (count: number) => {
      setStats((prev) => ({ ...prev, activeUsers: count }));
    });

    return () => {
      socket?.off('activeUsers');
      socket?.disconnect();
      socket = null;
    };
  }, []);

  return (
    <section className="w-full py-16 flex flex-col items-center">
      {/*  Mobile Circular Layout */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center md:hidden">
        {/* Center Circle */}
        <div className="absolute z-20 w-34 h-34 bg-[#f9fafc] rounded-full shadow-[0_0_6px_rgba(59,130,246,0.08)] flex flex-col items-center justify-center text-center border border-blue-200">
          <FaUsers className="text-black text-4xl mb-1" />
          <div className="text-sm font-semibold text-[#492a60]">Active Users</div>
          <div className="flex items-center gap-1 text-lg font-bold text-[#492a60]">
            <span className="blinking-dot" />
            {formatNumber(stats.activeUsers)}
          </div>
        </div>

        {/* Top Left */}
        <div className="absolute top-[-20px] left-[-20px] w-[157px] h-[157px] rounded-tl-[200px] bg-[#f9fafc] border border-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.08)] flex flex-col justify-center items-center">
          <FaCheckCircle className="text-black text-3xl ml-8" />
          <p className="text-sm ml-4 text-black font-medium">Issues Solved</p>
          <p className="text-[#492a60] ml-2 font-semibold text-xl">
            {formatNumber(stats.issuesSolved)}
          </p>
        </div>

        {/* Top Right */}
        <div className="absolute top-[-20px] right-[-20px] w-[157px] h-[157px] rounded-tr-[200px] bg-[#f9fafc] border border-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.08)] flex flex-col justify-center items-center">
          <FaEye className="text-black text-3xl mr-6" />
          <p className="text-sm text-black font-medium">YouTube Views</p>
          <div className="flex items-center gap-1 text-lg font-semibold text-[#492a60]">
            <span className="blinking-dot" />
            {formatNumber(stats.youtubeViews)}
          </div>
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-[-20px] left-[-20px] w-[157px] h-[157px] rounded-bl-[200px] bg-[#f9fafc] border border-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.08)] flex flex-col justify-center items-center">
          <FaYoutube className="text-black text-3xl ml-2 -mt-4" />
          <p className="text-sm text-black ml-4 font-medium">Subscribers</p>
          <p className="text-[#492a60] ml-4 font-semibold text-lg">
            {formatNumber(stats.subscribers)}
          </p>
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-[-20px] right-[-20px] w-[157px] h-[157px] rounded-br-[200px] bg-[#f9fafc] border border-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.08)] flex flex-col justify-center items-center">
          <FaUserGraduate className="text-black text-3xl -mt-4" />
          <p className="text-sm text-black font-medium">Total Learners</p>
          <p className="text-[#492a60] font-semibold mr-4 text-xl">
            {formatNumber(stats.totalStudents)}
          </p>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden md:grid w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center px-20">
        <StatCard
          label="Issues Solved"
          value={stats.issuesSolved}
          icon={<FaCheckCircle className="text-black text-3xl" />}
          numberColor="from-pink-400 to-purple-400"
        />
        <StatCard
          label="YouTube Views"
          value={stats.youtubeViews}
          icon={<FaEye className="text-black text-3xl" />}
          numberColor="from-pink-400 to-purple-400"
          showBlink
        />
        <StatCard
          label="Subscribers"
          value={stats.subscribers}
          icon={<FaYoutube className="text-black text-3xl" />}
          numberColor="from-pink-400 to-purple-400"
        />
        <StatCard
          label="Total Learners"
          value={stats.totalStudents}
          icon={<FaUserGraduate className="text-black text-3xl" />}
          numberColor="from-pink-400 to-purple-400"
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon={<FaUsers className="text-black text-3xl" />}
          numberColor="from-pink-400 to-purple-400"
          showBlink
        />
      </div>

      {/* Blinking Dot Animation */}
      <style jsx global>{`
        @keyframes blink {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 15px 5px rgba(0, 255, 0, 0.8);
          }
          50% {
            transform: scale(1.4);
            opacity: 0.6;
            box-shadow: 0 0 25px 8px rgba(0, 255, 0, 0.6);
          }
        }

       .blinking-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #00ff00;
  display: inline-block;
  animation: blink 1.2s infinite ease-in-out;
  position: relative; 
  z-index: auto;       
}

      `}</style>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  numberColor,
  showBlink,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  numberColor: string;
  showBlink?: boolean;
}) {
  const [prevValue, setPrevValue] = useState(value);
  useEffect(() => setPrevValue(value), [value]);
  const isIncreasing = value >= prevValue;

  return (
    <div
      className={`flex flex-col justify-between items-center bg-[#f9fafc]
rounded-2xl border border-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.15)]
hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]

        transition-all duration-300 p-2`}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <div className="text-black text-xl">{icon}</div>}
        <span className="text-black text-sm font-medium">{label}</span>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 text-2xl font-semibold text-[#492a60]">
        {showBlink && <span className="blinking-dot" />}

        {formatNumber(value)}
      </div>
    </div>
  );
}
