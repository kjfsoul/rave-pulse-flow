import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Headphones, Home, Music, Newspaper, ShoppingBag, User } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthForm } from './auth/AuthForm';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "EDM Shuffle",
  showHeader = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const navItems = [
    { icon: Home, label: "Explore", path: "/" },
    { icon: Headphones, label: "Studio", path: "/pro-dj-station" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Music, label: "Festival", path: "/festival" },
    { icon: Newspaper, label: "News", path: "/news" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-bass-dark relative flex flex-col">
      {/* Header Navigation - Always Visible */}
      {showHeader && (
        <header className="sticky top-0 z-50 w-full bg-bass-dark/95 backdrop-blur-lg border-b border-neon-purple/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Left: Logo/Home */}
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 flex items-center gap-2"
              >
                <span className="text-2xl">🕺</span>
                <span className="text-lg md:text-xl font-bold">{title}</span>
              </Button>

              {/* Center: Navigation Links - Desktop Only */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path ||
                    (item.path === '/pro-dj-station' && location.pathname.startsWith('/pro-dj-station')) ||
                    (item.path === '/' && location.pathname === '/');

                  return (
                    <Button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={`flex items-center gap-2 ${
                        isActive
                          ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </nav>

              {/* Right: Profile/User Actions */}
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <Button
                      onClick={() => navigate('/profile')}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </Button>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowAuthDialog(true)}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      Sign In / Sign Up
                    </Button>
                    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Sign In / Sign Up to EDM Shuffle</DialogTitle>
                          <DialogDescription>
                            Access your profile, tracks, and more
                          </DialogDescription>
                        </DialogHeader>
                        <AuthForm onSuccess={() => setShowAuthDialog(false)} />
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;
