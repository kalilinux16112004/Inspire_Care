'use client';

import { Calendar, Users, Stethoscope, Image, Settings, Menu, X, Mail } from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: Calendar,
      label: 'Appointments',
      value: 'appointments',
      count: null,
    },
    {
      icon: Stethoscope,
      label: 'Doctors',
      value: 'doctors',
      count: null,
    },
    {
      icon: Users,
      label: 'Services',
      value: 'services',
      count: null,
    },
    {
      icon: Image,
      label: 'Gallery',
      value: 'gallery',
      count: null,
    },
    {
      icon: Mail,
      label: 'Communications',
      value: 'communications',
      count: null,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-primary text-white p-2 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-border flex flex-col transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static fixed h-screen z-30`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border pt-16 md:pt-6">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Team Inspire Care</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;

            return (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.count && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Support</p>
            <p>Need help? Contact: support@teaminspirecare.com</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
