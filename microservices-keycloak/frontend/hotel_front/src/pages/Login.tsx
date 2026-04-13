import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DoorOpen, CalendarDays, Star, Package, Megaphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const features = [
  { icon: DoorOpen, text: 'Manage Rooms Efficiently' },
  { icon: CalendarDays, text: 'Handle Reservations' },
  { icon: Star, text: 'Guest Reviews & Ratings' },
  { icon: Package, text: 'Stock Management' },
  { icon: Megaphone, text: 'Event Planning' },
  { icon: Users, text: 'Staff Management' },
];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login();
      toast.success('Redirecting to Keycloak...');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <DoorOpen className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hotel Management</h1>
              <p className="text-sm text-muted-foreground">System</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use your Keycloak account to access the hotel management system.
              </p>
              <Button type="button" onClick={handleLogin}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                disabled={loading}>
                {loading ? 'Redirecting...' : 'Sign In with Keycloak'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Features Panel */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md animate-fade-in">
          <h2 className="text-3xl font-bold text-primary-foreground mb-3">Everything you need to manage your hotel</h2>
          <p className="text-primary-foreground/70 mb-10">A comprehensive platform for managing rooms, bookings, staff, and more.</p>
          <div className="space-y-5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-primary-foreground font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
