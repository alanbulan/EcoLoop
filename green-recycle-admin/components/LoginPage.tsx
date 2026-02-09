import React from 'react';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useLoginForm } from '../hooks/useLoginForm';
import brandLogo from '@miniapp/logo.png';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit
  } = useLoginForm(onLogin);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <img src={brandLogo} alt="品牌图标" style={{ width: '48px', height: '48px' }} className="w-12 h-12 rounded-2xl" />
            <span className="font-bold text-3xl tracking-tight text-slate-800">绿色回收</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">管理员登录</h2>
            <p className="text-slate-500 text-sm text-center mb-8">欢迎回到绿色回收管理后台</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 ml-1">账号</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="!pl-10"
                    placeholder="请输入管理员账号"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 ml-1">密码</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!pl-10"
                    placeholder="请输入密码"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    登录中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    立即登录 <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>
          </div>
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              测试账号: <span className="font-mono font-medium text-slate-700">admin</span> / 密码: <span className="font-mono font-medium text-slate-700">admin</span>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-400 text-xs">
          &copy; 2026 绿色回收管理后台
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
