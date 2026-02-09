import React, { useState } from 'react';
import { apiRequest } from '../api/client';

/**
 * ⚠️4修复: 管理后台登录改为真实 API 鉴权
 * 登录成功后将 token 存入 localStorage，后续请求自动携带
 */
export const useLoginForm = (onLoginSuccess: () => void) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiRequest<{ token: string; username: string }>('/api/v1/admin/login', {
        method: 'POST',
        body: { username, password },
      });
      // 存储 token，后续 API 请求自动携带
      localStorage.setItem('gr_admin_token', res.token);
      localStorage.setItem('gr_admin_authed', '1');
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || '账号或密码错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit
  };
};
