import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminBottomNavigation from './AdminBottomNavigation';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 to-midnight-950 flex flex-col">
      <AdminNavbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:pb-8" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0))' }}>
        <Outlet />
      </main>
      <AdminBottomNavigation />
    </div>
  );
}

export default Layout;

