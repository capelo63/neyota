'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">NEYOTA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/projects" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Projets
            </Link>
            <Link href="/talents" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Talents
            </Link>
            <Link href="/about" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              À propos
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                S&apos;inscrire
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link href="/projects" className="text-neutral-700 hover:text-primary-600 font-medium py-2">
                Projets
              </Link>
              <Link href="/talents" className="text-neutral-700 hover:text-primary-600 font-medium py-2">
                Talents
              </Link>
              <Link href="/about" className="text-neutral-700 hover:text-primary-600 font-medium py-2">
                À propos
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-neutral-200">
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" className="w-full">
                    S&apos;inscrire
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
