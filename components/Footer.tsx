'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border-t border-slate-200 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-blue-600 dark:text-blue-400">Team Inspire Care</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              Multispeciality Hospital dedicated to providing compassionate, high-quality and comprehensive healthcare services.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 w-10 h-10 flex items-center justify-center" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 w-10 h-10 flex items-center justify-center" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 w-10 h-10 flex items-center justify-center" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 w-10 h-10 flex items-center justify-center" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-900 dark:text-slate-200">Quick Links</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-900 dark:text-slate-200">Specialties</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  General Medicine
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  Surgical
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  Pediatrics
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 block">
                  Orthopedics
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-900 dark:text-slate-200">Contact</h4>
            <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <p className="font-bold text-slate-500 dark:text-slate-400">Emergency Hotline</p>
                <p className="text-red-600 dark:text-red-400 font-extrabold text-base tracking-wide mt-0.5">+91-XXXX-XXXX-99</p>
              </li>
              <li>
                <p className="font-bold text-slate-500 dark:text-slate-400">General Inquiries</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">+91-XXXX-XXXX-XX</p>
              </li>
              <li>
                <p className="font-bold text-slate-500 dark:text-slate-400">Email Support</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">contact@teaminspirecare.com</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <p>
              &copy; {currentYear} Team Inspire Care. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-1">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-1">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors py-1">
                Compliance
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
