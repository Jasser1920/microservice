import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, DoorOpen, CalendarDays, Star,
  Package, Megaphone, Settings, ChevronLeft, ChevronRight,
  LogOut, ChevronDown, ChevronUp
} from 'lucide-react';
import { Role } from '@/types';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  roles: Role[];
  children?: { label: string; path: string; roles: Role[] }[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'] },
  {
    label: 'Users', icon: Users, roles: ['ADMIN'],
    children: [
      { label: 'List Users', path: '/users', roles: ['ADMIN'] },
      { label: 'User Roles', path: '/users/roles', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Rooms', icon: DoorOpen, roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'],
    children: [
      { label: 'Rooms List', path: '/rooms', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'] },
      { label: 'Room Status', path: '/rooms/status', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    ],
  },
  {
    label: 'Bookings', icon: CalendarDays, roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'],
    children: [
      { label: 'All Bookings', path: '/bookings', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { label: 'My Bookings', path: '/bookings/mine', roles: ['CLIENT'] },
    ],
  },
  {
    label: 'Reviews', icon: Star, roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'],
    children: [
      { label: 'All Reviews', path: '/reviews', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'] },
      { label: 'My Reviews', path: '/reviews/mine', roles: ['CLIENT'] },
    ],
  },
  {
    label: 'Inventory', icon: Package, roles: ['ADMIN', 'MANAGER', 'STAFF'],
    children: [
      { label: 'Stock List', path: '/stock', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { label: 'Low Stock Alerts', path: '/stock/alerts', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    ],
  },
  {
    label: 'Events', icon: Megaphone, roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'],
    children: [
      { label: 'All Events', path: '/events', roles: ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'] },
      { label: 'Create Event', path: '/events/create', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['ADMIN'] },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['Bookings']);
  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const filteredItems = menuItems.filter(item => hasPermission(item.roles));

  return (
    <aside
      className={`h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <DoorOpen className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-base text-sidebar-primary-foreground">Hotel Manager</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.label);
          const isActive = item.path ? location.pathname === item.path : item.children?.some(c => location.pathname === c.path);
          const visibleChildren = item.children?.filter(c => hasPermission(c.roles));

          if (item.path) {
            return (
              <button key={item.label} onClick={() => navigate(item.path!)}
                className={`sidebar-item w-full ${isActive ? 'active' : ''}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }

          return (
            <div key={item.label}>
              <button onClick={() => collapsed ? navigate(visibleChildren?.[0]?.path || '/') : toggleMenu(item.label)}
                className={`sidebar-item w-full ${isActive ? 'active' : ''}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </>
                )}
              </button>
              {!collapsed && isOpen && visibleChildren && (
                <div className="ml-8 mt-1 space-y-0.5">
                  {visibleChildren.map(child => (
                    <button key={child.path} onClick={() => navigate(child.path)}
                      className={`sidebar-item w-full text-xs ${location.pathname === child.path ? 'active' : 'text-sidebar-muted'}`}>
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full text-sidebar-muted">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
