import React, { useState } from 'react';
import apiService from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    try {
      const response = await apiService.post('/auth/login', {
        username,
        password,
      });

      const data = response.data;

      if (data.access_token) {
        // Lưu token
        localStorage.setItem('token', data.access_token);

        // Thông báo đăng nhập thành công
        alert('Đăng nhập thành công!'); // Tạm thời, bạn có thể thay bằng toast sau

        // Chuyển hướng về trang chủ (cách đơn giản)
        window.location.href = '/'; 
        // Hoặc nếu dùng react-router-dom:
        // navigate('/');
      } else {
        setError('Đăng nhập thất bại');
      }
    } catch (err: any) {
      console.error(err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else {
        setError('Không thể kết nối đến server. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              👤
            </div>
            <h1 className="text-3xl font-bold">Đăng nhập</h1>
            <p className="text-blue-100 mt-2">Chào mừng bạn quay trở lại</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-2xl text-lg transition-all active:scale-[0.97] shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <a href="#" className="text-blue-600 hover:underline text-sm">
                Quên mật khẩu?
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-white/70 text-sm mt-6">
          © 2026 - Đăng nhập để tiếp tục
        </p>
      </div>
    </div>
  );
};

export default LoginPage;