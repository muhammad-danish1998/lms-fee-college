import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Sliders, BookOpen, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students Directory', icon: Users },
  { to: '/enroll', label: 'Enroll Student', icon: UserPlus },
  { to: '/config', label: 'Academic Streams', icon: Sliders },
];

export function Sidebar({ mobileMenuOpen, onCloseMobileMenu }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fadeIn"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-72 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Portal Navigation</span>
          <button
            onClick={onCloseMobileMenu}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="p-4 space-y-1.5 flex-1">
          <div className="hidden md:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Summary Box */}
        <div className="p-4 m-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2 mt-auto">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Active Academic Sessions</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Annual I &amp; Annual II (Regular, Private &amp; Combine Gap Admissions)
          </p>
        </div>
      </aside>
    </>
  );
}
