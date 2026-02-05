import { Home, Plus, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onCreateBet: () => void;
}

export function BottomNav({ onCreateBet }: BottomNavProps) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Arena', path: '/' },
    { icon: Plus, label: 'Create', path: null, action: onCreateBet },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isCenter = index === 1;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold btn-gold-glow">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "glow-gold")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
