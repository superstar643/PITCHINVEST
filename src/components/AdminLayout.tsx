import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileCheck, 
  UserCheck, 
  Users, 
  BarChart3, 
  CreditCard, 
  DollarSign, 
  Image as ImageIcon 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const adminNavItems = [
    { title: 'Dashboard', link: '/admin', icon: LayoutDashboard, iconColor: 'text-[#0a3d5c]', iconBg: 'bg-[#0a3d5c]/10' },
    { title: 'Manage Projects', link: '/admin/projects', icon: FileCheck, iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
    { title: 'Profile Approval', link: '/admin/profile-approval', icon: UserCheck, iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { title: 'Manage Users', link: '/admin/users', icon: Users, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    { title: 'Analytics', link: '/admin/analytics', icon: BarChart3, iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
    { title: 'View Invoices', link: '/admin/invoices', icon: CreditCard, iconColor: 'text-teal-600', iconBg: 'bg-teal-100' },
    { title: 'Manage Pricing', link: '/admin/pricing', icon: DollarSign, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' },
    { title: 'Advertising', link: '/admin/advertising', icon: ImageIcon, iconColor: 'text-pink-600', iconBg: 'bg-pink-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold text-[#0a3d5c] mb-6 px-2">Admin Panel</h2>
          <nav className="space-y-1">
            {adminNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.link || (item.link !== '/admin' && location.pathname.startsWith(item.link));
              return (
                <Link
                  key={index}
                  to={item.link}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0a3d5c] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#0a3d5c]'
                  }`}
                >
                  <div className={`${isActive ? 'bg-white/20' : item.iconBg} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.iconColor}`} />
                  </div>
                  <span className="font-semibold text-sm">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
