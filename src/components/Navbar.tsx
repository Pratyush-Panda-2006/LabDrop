import React from 'react';
import { VaultMode } from '../types';
import { ArrowLeftRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  mode: VaultMode;
  onModeChange: (mode: VaultMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ mode, onModeChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const handleTabClick = (targetMode: VaultMode) => {
    if (isDashboard) {
      navigate('/');
    }
    onModeChange(targetMode);
  };

  const toggleMode = () => {
    if (isDashboard) {
      navigate('/');
      return;
    }
    onModeChange(mode === 'upload' ? 'retrieve' : 'upload');
  };

  return (
    <nav className="flex items-center justify-between px-20 pt-6 pb-4 max-md:px-6 max-md:pt-5 relative">
      {/* Left: Wordmark Logo */}
      <div
        className="flex items-center cursor-pointer select-none"
        onClick={() => navigate('/')}
      >
        <span className="font-display text-[40px] max-md:text-[32px] text-black leading-none tracking-tight">
          labdrop
        </span>
      </div>

      {/* Center: Absolutely centered tab group (Only Upload & Retrieve) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 max-md:hidden items-center">
        <button
          type="button"
          onClick={() => handleTabClick('upload')}
          className={`font-sans text-base transition-all duration-200 pb-1 cursor-pointer select-none ${
            !isDashboard && mode === 'upload'
              ? 'font-bold text-vault-text border-b-2 border-black'
              : 'font-normal text-vault-text hover:opacity-55 border-b-2 border-transparent'
          }`}
        >
          Upload (Lab)
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('retrieve')}
          className={`font-sans text-base transition-all duration-200 pb-1 cursor-pointer select-none ${
            !isDashboard && mode === 'retrieve'
              ? 'font-bold text-vault-text border-b-2 border-black'
              : 'font-normal text-vault-text hover:opacity-55 border-b-2 border-transparent'
          }`}
        >
          Retrieve (Hostel)
        </button>
      </div>

      {/* Right: Mode Switch Toggle Button */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={toggleMode}
          className="bg-vault-dark text-[#fafafa] px-5 py-3.5 rounded-full uppercase tracking-[0.04em] text-[15px] font-medium hover:bg-[#333] active:scale-95 transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 opacity-80" />
          <span>{mode === 'upload' ? 'Hostel Mode' : 'Lab Mode'}</span>
        </button>
      </div>
    </nav>
  );
};
