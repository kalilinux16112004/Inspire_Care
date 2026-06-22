'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/#contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-sm border-b border-border/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/hospital-logo.png"
              alt="Team Inspire Care"
              className="h-12 w-auto dark:brightness-110"
            />
            <span className="hidden sm:block text-lg font-bold text-primary dark:text-blue-400">Team Inspire Care</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-all duration-200 font-semibold text-sm ${
                  isActive(item.href)
                    ? 'text-primary dark:text-blue-400 font-bold border-b-2 border-primary dark:border-blue-400 pb-1'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons & Theme Switcher (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 w-11 h-11 flex items-center justify-center active:scale-95 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}
            <Button 
              size="sm" 
              onClick={() => window.dispatchEvent(new CustomEvent('openBooking'))}
              className="cursor-pointer active:scale-95 transition-all font-semibold"
            >
              Book Quick Appointment
            </Button>
          </div>

          {/* Mobile Navigation Area */}
          <div className="md:hidden flex items-center gap-1.5">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 w-11 h-11 flex items-center justify-center active:scale-95 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 w-11 h-11 flex items-center justify-center active:scale-95 cursor-pointer"
                  aria-label="Open Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-6 bg-white dark:bg-slate-900 border-l border-border/40">
                <SheetHeader className="mb-6 flex flex-row justify-between items-center p-0 border-b border-border/20 pb-4">
                  <SheetTitle className="text-lg font-bold text-primary dark:text-blue-400">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-primary dark:text-blue-400 bg-primary/10 dark:bg-primary/20 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-border/20 pt-4 mt-2">
                    <Button
                      className="w-full font-semibold h-11 rounded-lg cursor-pointer active:scale-95 transition-all text-sm"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('openBooking'));
                        setIsOpen(false);
                      }}
                    >
                      Book Quick Appointment
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
