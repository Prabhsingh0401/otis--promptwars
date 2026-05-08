'use client';
// app/(dashboard)/profile/page.tsx — User profile & settings

import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Shield, ChevronRight } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/app/providers';
import { useTrips } from '@/hooks/useItinerary';
import NavigationBar from '@/components/ui/NavigationBar';

interface ListItemProps {
  icon:     React.ReactNode;
  label:    string;
  detail?:  string;
  onClick?: () => void;
  danger?:  boolean;
}

function ListItem({ icon, label, detail, onClick, danger = false }: ListItemProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-4 px-4 py-3.5 min-h-touch text-left group',
        'hover:bg-fill-quaternary active:bg-fill-tertiary transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
      ].join(' ')}
      aria-label={label}
    >
      <div className={[
        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        danger ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'
      ].join(' ')}>
        {icon}
      </div>
      <span className={`flex-1 text-[17px] font-medium ${danger ? 'text-destructive' : 'text-label-primary'}`}>
        {label}
      </span>
      {detail && (
        <span className="text-callout text-label-secondary font-normal">{detail}</span>
      )}
      {!danger && (
        <ChevronRight 
          size={16} 
          strokeWidth={2} 
          className="text-label-quaternary group-hover:text-label-secondary transition-colors" 
          aria-hidden 
        />
      )}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data: trips } = useTrips(user?.uid);

  async function handleSignOut() {
    await signOut(auth);
    // Clear session cookie
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="bg-bg-secondary min-h-full">
        <NavigationBar title="Me" largeTitle />
        <div className="flex items-center justify-center pt-20">
          <div className="h-8 w-8 rounded-full border-3 border-accent border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const tripsCount = trips?.length ?? 0;
  const completedTrips = trips?.filter((t) => t.status === 'completed').length ?? 0;

  return (
    <div className="bg-bg-secondary min-h-full pb-24 pt-12">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        {/* Profile Header */}
        <section className="flex flex-col items-center py-4 animate-card-in" aria-label="User profile">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-tr from-accent to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-bg-tertiary border-2 border-bg-secondary flex items-center justify-center overflow-hidden shadow-xl">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'Profile photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <User size={44} strokeWidth={1.5} className="text-label-tertiary" aria-hidden />
              )}
            </div>
          </div>
          <div className="mt-5 text-center">
            <h1 className="text-[28px] font-bold text-label-primary tracking-tight">
              {user?.displayName ?? 'Traveler'}
            </h1>
            <p className="text-[15px] font-medium text-label-secondary mt-0.5 opacity-80">
              {user?.email}
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section
          className="grid grid-cols-2 gap-4 animate-card-in"
          style={{ animationDelay: '100ms' }}
          aria-label="Trip statistics"
        >
          {[
            { label: 'Trips Planned', value: tripsCount, color: 'from-blue-500 to-cyan-500' },
            { label: 'Trips Taken', value: completedTrips, color: 'from-indigo-500 to-purple-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-bg-tertiary rounded-[24px] p-5 shadow-sm border border-separator/50 flex flex-col items-center justify-center transition-transform active:scale-95">
              <span className={`text-3xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </span>
              <span className="text-[13px] font-bold text-label-tertiary uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Settings Sections */}
        <div className="space-y-6">
          <section aria-label="Account settings" className="animate-card-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-label-tertiary mb-3 ml-4">
              Account
            </h2>
            <div className="rounded-[22px] bg-bg-tertiary shadow-sm border border-separator/50 overflow-hidden divide-y divide-separator/50">
              <ListItem
                icon={<User size={18} />}
                label="Edit Profile"
                onClick={() => {/* TODO */}}
              />
              <ListItem
                icon={<Settings size={18} />}
                label="Preferences"
                detail="Moderate · Cultural"
                onClick={() => {/* TODO */}}
              />
              <ListItem
                icon={<Shield size={18} />}
                label="Privacy & Security"
                onClick={() => {/* TODO */}}
              />
            </div>
          </section>

          <section aria-label="Support & App" className="animate-card-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-label-tertiary mb-3 ml-4">
              Otis App
            </h2>
            <div className="rounded-[22px] bg-bg-tertiary shadow-sm border border-separator/50 overflow-hidden divide-y divide-separator/50">
              <ListItem
                icon={<Settings size={18} />}
                label="Notifications"
                detail="On"
                onClick={() => {/* TODO */}}
              />
              <ListItem
                icon={<Shield size={18} />}
                label="Help & Feedback"
                onClick={() => {/* TODO */}}
              />
            </div>
          </section>

          <section aria-label="Session" className="animate-card-in" style={{ animationDelay: '400ms' }}>
            <div className="rounded-[22px] bg-bg-tertiary shadow-sm border border-separator/50 overflow-hidden">
              <ListItem
                icon={<LogOut size={18} />}
                label="Sign Out"
                onClick={handleSignOut}
                danger
              />
            </div>
          </section>
        </div>

        <div className="text-center space-y-1 py-8 opacity-40">
          <p className="text-[13px] font-bold text-label-tertiary tracking-wide uppercase">
            Otis v1.0.4
          </p>
          <p className="text-[12px] font-medium text-label-tertiary">
            Designed for the future of travel
          </p>
        </div>
      </div>
    </div>
  );
}
