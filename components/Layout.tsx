import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Home,
  User,
  ClipboardList,
  Plus,
  Info,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Activity,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, roles: ['student'] },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['student'] },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar, roles: ['student'] },
    { label: 'Roadmap', path: '/dashboard/roadmap', icon: Activity, roles: ['student'] },
    { label: 'Branding', path: '/dashboard/branding', icon: User, roles: ['student'] },
    { label: 'Networking', path: '/dashboard/networking', icon: Sparkles, roles: ['student'] },
    { label: 'The Vault', path: '/dashboard/vault', icon: BookOpen, roles: ['student'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['student', 'mentor'] },
    { label: 'Mentees', path: '/dashboard?tab=mentees', icon: Users, roles: ['mentor'] },
    { label: 'Sessions', path: '/dashboard?tab=sessions', icon: Calendar, roles: ['mentor'] },
    { label: 'Reviews', path: '/dashboard?tab=feedback', icon: MessageCircle, roles: ['mentor'] },
  ].filter(item => item.roles.includes(role));

  const helpItems = [
    { label: 'About Mentor', path: '/about', icon: User },
    { label: 'Programs', path: '/programs', icon: BookOpen },
    { label: 'FAQ', path: '/faq', icon: HelpCircle },
    { label: 'Contact', path: '/contact', icon: MessageCircle },
  ];

  const mobileNavItems = role === 'mentor' ? [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Overview', path: '/dashboard?tab=overview', icon: LayoutDashboard },
    { label: 'Mentees', path: '/dashboard?tab=mentees', icon: Users },
    { label: 'Sessions', path: '/dashboard?tab=sessions', icon: Calendar },
    { label: 'Reviews', path: '/dashboard?tab=feedback', icon: MessageCircle },
    { label: 'Account', path: '/settings', icon: User },
  ] : [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { label: 'Roadmap', path: '/dashboard/roadmap', icon: Activity },
    { label: 'Branding', path: '/dashboard/branding', icon: Sparkles },
    { label: 'Vault', path: '/dashboard/vault', icon: BookOpen },
    { label: 'Account', path: '/settings', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    const currentFull = location.pathname + location.search;
    if (path.includes('?')) {
      return currentFull === path;
    }
    // For nested routes like /dashboard/sessions
    if (location.pathname.startsWith(path) && path !== '/dashboard') {
      return true;
    }
    // Exact match for /dashboard or /settings
    return location.pathname === path && (location.search === '' || path === '/dashboard');
  };
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex bg-[#FDFDFD] flex-col lg:flex-row relative overflow-x-hidden">
      {/* Decorative Background Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>
      {/* Mobile Top Bar - Hidden on landing page to avoid overlap */}
      {role !== 'visitor' && !isLandingPage && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-black/[0.03] z-50 flex items-center justify-between px-6"
        >
           <Link to="/" className="text-sm font-black tracking-tighter text-black uppercase">Mentorino</Link>
           <div className="flex items-center gap-2">
             <Link to="/settings" className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black hover:scale-110 transition-transform active:scale-95">
               {role === 'mentor' ? 'M' : 'S'}
             </Link>
           </div>
        </motion.div>
      )}

      {/* Desktop Sidebar */}
      {role !== 'visitor' && !isLandingPage && (
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 z-[60] transition-transform duration-500
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          hidden lg:flex flex-col
        `}>
          <div className="p-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 group">
              <span className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">M</span>
              MENTORINO
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <nav className="px-4 space-y-1">
              <div className="pb-4">
                <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Main Menu</p>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="px-4 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Information</p>
                {helpItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-slate-100 text-black' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-50 mt-auto">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full ${(role === 'visitor' || isLandingPage) ? '' : 'px-4 sm:px-6 md:px-8 lg:px-12 pb-24 sm:pb-32 lg:pb-12 pt-20 sm:pt-24 lg:pt-12'}`}>
        <div className={`mx-auto ${(role === 'visitor' || isLandingPage) ? '' : 'max-w-7xl'}`}>
          {children}
        </div>
      </main>

      {/* Premium Bottom Nav (Mobile) */}
      {role !== 'visitor' && !isLandingPage && (
        <motion.nav 
          initial={{ y: 100, x: '-50%' }}
          animate={{ y: 0, x: '-50%' }}
          className="lg:hidden fixed bottom-4 sm:bottom-6 left-1/2 w-[95%] max-w-sm sm:max-w-md bg-black/90 backdrop-blur-2xl border border-white/10 h-16 sm:h-20 rounded-full z-[100] flex items-center justify-around px-2 shadow-2xl shadow-black/20"
        >
          {mobileNavItems.map((item) => (
            <Link 
              key={item.path + (item.label === 'Sessions' ? 'sessions' : '')} 
              to={item.path}
              className="group flex flex-col items-center gap-1 transition-all"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 transition-all ${location.pathname + location.search === item.path ? 'text-white scale-110' : 'text-white/40'}`}
              >
                <item.icon size={18} className="sm:w-5 sm:h-5" />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </motion.nav>
      )}
    </div>
  );
};

export default Layout;