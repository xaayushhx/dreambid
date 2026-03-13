import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon,
  SparklesIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  NewspaperIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

function AdminBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin/properties', label: 'Properties', icon: DocumentTextIcon },
    { path: '/admin/featured', label: 'Featured', icon: SparklesIcon },
    { path: '/admin/enquiries', label: 'Enquiries', icon: QuestionMarkCircleIcon },
    { path: '/admin/blogs', label: 'Blogs', icon: NewspaperIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-midnight-800 border-t border-midnight-700 shadow-lg md:hidden z-40">
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

export default AdminBottomNavigation;
