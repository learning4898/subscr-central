import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-semibold text-foreground">
                SubTracker
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/subscriptions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Subscriptions
              </Link>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </Link>
              {user && (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                  <span className="text-sm text-muted-foreground">{user.name}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/subscriptions"
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Subscriptions
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              {user && (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border mt-2 pt-2">
                    {user.name}
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
