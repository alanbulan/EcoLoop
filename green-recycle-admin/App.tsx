import React from 'react';
import './index.css';
import { 
  LayoutDashboard, 
  Coins, 
  Truck, 
  Wallet, 
  Menu, 
  X, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import PriceManagement from './components/PriceManagement';
import OrderManagement from './components/OrderManagement';
import FinanceManagement from './components/FinanceManagement';
import AuditLogManagement from './components/AuditLogManagement';
import LoginPage from './components/LoginPage';
import type { TabView } from './types';
import { useAuth } from './hooks/useAuth';
import { useNavigation } from './hooks/useNavigation';
import brandLogo from '@miniapp/logo.png';

const App: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { 
    activeTab, 
    setActiveTab, 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    resetNavigation
  } = useNavigation('dashboard');

  const handleLogout = () => {
    if (logout()) {
      resetNavigation();
    }
  };

  const NavItem = ({ tab, label, icon: Icon }: { tab: TabView; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        closeMobileMenu();
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-emerald-50 text-emerald-600 font-medium' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  // If not authenticated, show Login Page
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={brandLogo} alt="品牌图标" className="w-7 h-7 rounded-md" />
          <span className="font-bold text-lg text-slate-800">绿色回收</span>
        </div>
        <button onClick={toggleMobileMenu} className="text-slate-500">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen md:flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <img src={brandLogo} alt="品牌图标" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-xl tracking-tight text-slate-800">绿色回收后台</span>
            </div>
          </div>

          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NavItem tab="dashboard" label="总览仪表盘" icon={LayoutDashboard} />
            <NavItem tab="pricing" label="价格管理" icon={Coins} />
            <NavItem tab="orders" label="订单调度" icon={Truck} />
            <NavItem tab="finance" label="财务审核" icon={Wallet} />
            <NavItem tab="audit" label="审计日志" icon={ShieldCheck} />
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                管
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">管理员</p>
                <p className="text-xs text-slate-500">后台账户</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors py-2 rounded-lg"
            >
              <LogOut size={18} />
              <span className="text-sm">退出登录</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => closeMobileMenu()}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'pricing' && <PriceManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'finance' && <FinanceManagement />}
          {activeTab === 'audit' && <AuditLogManagement />}
        </div>
      </main>
    </div>
  );
};

export default App;
