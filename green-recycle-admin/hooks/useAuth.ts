import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('gr_admin_authed') === '1';
    } catch {
      return false;
    }
  });

  const login = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem('gr_admin_authed', '1');
    } catch {}
  };

  const logout = () => {
    if (window.confirm("确定要退出登录吗？")) {
      setIsAuthenticated(false);
      try {
        // ⚠️4修复: 退出时同时清除 token
        localStorage.removeItem('gr_admin_authed');
        localStorage.removeItem('gr_admin_token');
      } catch {}
      return true;
    }
    return false;
  };

  return { isAuthenticated, login, logout };
};
