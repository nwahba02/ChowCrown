import React from 'react';
import { motion } from 'motion/react';
import { Home, Trophy, Users, Phone, Crown } from 'lucide-react';
import { useResponsive } from '../../hooks';

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'competitions', label: 'Compete', icon: Trophy },
    { id: 'join', label: 'Join', icon: Crown },
    { id: 'about', label: 'About', icon: Users },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-white/[0.08] safe-bottom"
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActivePage(item.id)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-smooth ${
                isActive ? 'text-amber' : 'text-fg-dim'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
