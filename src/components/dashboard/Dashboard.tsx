
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { User } from '@/pages/Index';
import MapView from '@/components/dashboard/MapView';
import ManageSurveys from '@/components/dashboard/ManageSurveys';
import ManageUsers from '@/components/dashboard/ManageUsers';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type ActiveView = 'map' | 'surveys' | 'users';

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState<ActiveView>('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'map' as ActiveView, label: 'Map View', icon: Map, available: true },
    { id: 'surveys' as ActiveView, label: 'Manage Surveys', icon: FileText, available: user.role === 'admin' },
    { id: 'users' as ActiveView, label: 'Manage Users', icon: Users, available: user.role === 'admin' },
  ].filter(item => item.available);

  const renderContent = () => {
    switch (activeView) {
      case 'map':
        return <MapView />;
      case 'surveys':
        return <ManageSurveys />;
      case 'users':
        return <ManageUsers />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-white">Survey Portal</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {sidebarOpen && item.label}
            </Button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
