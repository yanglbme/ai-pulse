import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { RightSidebar } from './right-sidebar';
import { MobileNav } from './mobile-nav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex gap-6">
          {/* Left sidebar - desktop only */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-8">
            {children}
          </main>

          {/* Right sidebar - xl only */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-20">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom nav for mobile */}
      <MobileNav />
    </div>
  );
}
