import React, { useState } from 'react';
import { ShieldCheck, LogOut, KeyRound, Menu, X } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';
import { useAuth } from '../../context/AuthContext';
import { UpdateCredentialsModal } from '../auth/UpdateCredentialsModal';

export function Navbar({ onToggleMobileMenu, mobileMenuOpen }) {
  const { user, logout } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const collegeName = import.meta.env.COLLEGE_NAME || "JMT Public Higher Secondary School and College";

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out from the staff portal?')) {
      logout();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & College Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <CollegeLogo className="w-9 h-9 sm:w-11 sm:h-11 shadow-md rounded-full bg-slate-800 p-0.5 border border-teal-500/30 shrink-0" />
          <div className="overflow-hidden">
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-tight line-clamp-1">
              {collegeName}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-teal-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
              <span className="hidden sm:inline">Admission &amp; Fee Management Portal</span>
              <span className="sm:hidden">Fee LMS Portal</span>
            </p>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* User Info Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-[11px]">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <div className="text-white font-semibold line-clamp-1">{user?.full_name || user?.username || 'Admin'}</div>
              <div className="text-[10px] text-teal-400 font-mono">{user?.role || 'Administrator'}</div>
            </div>
          </div>

          {/* Update Credentials Button */}
          <button
            onClick={() => setShowUpdateModal(true)}
            title="Update Admin Credentials & Password"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <KeyRound className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="hidden sm:inline">Credentials</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign Out from Staff Portal"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Update Credentials Modal */}
      {showUpdateModal && (
        <UpdateCredentialsModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        />
      )}
    </>
  );
}
