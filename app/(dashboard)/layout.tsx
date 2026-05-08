// app/(dashboard)/layout.tsx
// Dashboard shell — TabBar + per-page NavigationBar

import TabBar from '@/components/ui/TabBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-secondary flex flex-col">
      {/* Page content */}
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* Bottom tab navigation */}
      <TabBar />
    </div>
  );
}
