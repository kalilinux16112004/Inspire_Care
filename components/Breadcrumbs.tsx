'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-250/20 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
              {item.href ? (
                <Link href={item.href} className="text-primary hover:underline font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
