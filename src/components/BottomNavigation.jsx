import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  BuildingOffice2Icon, 
  HeartIcon, 
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/properties', label: 'Listed Properties', icon: BuildingOffice2Icon },
    { path: '/shortlisted', label: 'Saved', icon: HeartIcon },
    ...(user 
      ? [
          { path: '/profile', label: 'Profile', icon: UserIcon },
          { path: '/settings', label: 'Settings', icon: Cog6ToothIcon }
        ]
      : [
          { path: '/login', label: 'Login', icon: UserIcon }
        ]
    )
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-midnight-800 border-t border-midnight-700 shadow-lg md:hidden z-40" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 0.5rem)' }}>
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
              isActive(path)
                ? 'text-gold bg-midnight-700'
                : 'text-text-muted hover:text-gold hover:bg-midnight-750'
            }`}
            title={label}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-0.5 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;
