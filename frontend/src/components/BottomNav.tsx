import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  // Do not render bottom nav on login page or standalone player page
  if (location.pathname === '/login' || location.pathname === '/player') {
    return null;
  }

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/library', label: 'Library', icon: Library },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/80 backdrop-blur-2xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none ${
                isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`
            }
          >
            <Icon size={19} />
            <span className="text-[10px] mt-1 font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
