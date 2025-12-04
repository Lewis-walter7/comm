'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BackgroundScene } from '@/components/background';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* 3D Background Scene */}
      <BackgroundScene
        opacity={0.7}
        intensity={0.7}
        speed={1}
        particleCount={250}
        networkNodes={8}
        enableParallax={true}
      />
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SecureRealTime
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#security" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Security
              </a>
              <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#features" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                Features
              </a>
              <a href="#security" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                Security
              </a>
              <Link href="/login" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                Sign In
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 z-10">
        <div className="absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
              Collaborate Securely
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Real-time collaboration with end-to-end encryption. Built for teams who value security and productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 shadow-2xl border border-blue-100 dark:border-gray-700">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Military-grade encryption
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              All your documents and messages are encrypted client-side before they leave your device.
              Only you and your team can read them.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                🔒 End-to-End Encryption
              </span>
              <span className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full font-semibold">
                🛡️ Zero-Knowledge
              </span>
              <span className="px-6 py-3 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-full font-semibold">
                ⚡ Real-Time Sync
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of teams collaborating securely
          </p>
          <Link
            href="/register"
            className="inline-block px-12 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900/80 backdrop-blur-sm text-gray-400 py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">© 2024 SecureRealTime. Built with ❤️ for secure collaboration.</p>
          <p className="text-sm">
            Your data is encrypted. Your privacy is protected. Always.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '📝',
    title: 'Real-Time Documents',
    description: 'Collaborate on documents with live sync and conflict-free editing.',
  },
  {
    icon: '💬',
    title: 'Secure Chat',
    description: 'Encrypted messaging for every project. Share ideas and feedback instantly.',
  },
  {
    icon: '👥',
    title: 'Team Management',
    description: 'Invite team members, set roles, and manage permissions with ease.',
  },
  {
    icon: '🔐',
    title: 'End-to-End Encryption',
    description: 'Client-side encryption ensures only you can read your data.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built on modern tech for instant updates and seamless collaboration.',
  },
  {
    icon: '🚀',
    title: 'Simple & Powerful',
    description: 'Beautiful interface that is easy to use yet powerful for complex projects.',
  },
];

