import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

import { LayoutDashboard, Users, BookOpen, FileText, LogOut, Bell, UserCircle, Camera, Video, FileQuestion } from 'lucide-react';

export default function DashboardLayout({ children, role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Define sidebar links based on the role
  const professorLinks = [
    { name: 'Dashboard', path: '/professor/dashboard', icon: LayoutDashboard },
    { name: 'Live QR Scan', path: '/professor/qr-attendance', icon: BookOpen },
    { name: 'Attendance', path: '/professor/attendance', icon: Users },
    { name: 'Study Materials', path: '/professor/materials', icon: BookOpen },
    { name: 'Online Classes', path: '/professor/classes', icon: Video },
    { name: 'Create Test', path: '/professor/create-test', icon: FileQuestion },
    { name: 'Online Tests', path: '/professor/tests', icon: FileText },
    
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/student/attendance', icon: Users },
    { name: 'Scan Attendance', path: '/student/scan-qr', icon: Camera },
    { name: 'My Materials', path: '/student/materials', icon: BookOpen },
    { name: 'Take Online Exam', path: '/student/exams', icon: FileText },
  ];
  
  const links = role === 'professor' ? professorLinks : studentLinks;

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden flex-col md:flex">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-800">Smart Class</h2>
          <p className="text-sm text-gray-500 capitalize">{role} Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top App Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            {links.find(l => l.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 cursor-pointer">
              <UserCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content goes here */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
      
    </div>
  );
}