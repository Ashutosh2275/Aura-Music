import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/library', label: 'Library', icon: Library },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 pb-safe">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-emerald-400 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[11px] mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
