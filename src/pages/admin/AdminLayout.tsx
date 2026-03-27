import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isCurrentUserAdmin } from '../../api/admin-auth';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAuthenticated) {
        navigate('/user');
        return;
      }

      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      setIsLoading(false);

      if (!adminStatus) {
        navigate('/');
      }
    };

    checkAdmin();
  }, [isAuthenticated, navigate]);

  const isActive = (path: string) => location.pathname === path;

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>验证管理员权限...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <div className="admin-logo">
          <Link to="/admin">
            <span className="logo-icon">⚙️</span>
            <span className="logo-text">管理后台</span>
          </Link>
        </div>

        <div className="admin-nav">
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
            <span className="nav-icon">📊</span>
            <span>仪表盘</span>
          </Link>
          <Link to="/admin/config" className={isActive('/admin/config') ? 'active' : ''}>
            <span className="nav-icon">⚙️</span>
            <span>系统配置</span>
          </Link>
          <Link to="/admin/jobs" className={isActive('/admin/jobs') ? 'active' : ''}>
            <span className="nav-icon">⏰</span>
            <span>Job 调度</span>
          </Link>
          <Link to="/admin/collection" className={isActive('/admin/collection') ? 'active' : ''}>
            <span className="nav-icon">📥</span>
            <span>内容收集</span>
          </Link>
          <Link to="/admin/admins" className={isActive('/admin/admins') ? 'active' : ''}>
            <span className="nav-icon">👥</span>
            <span>管理员</span>
          </Link>
        </div>

        <div className="admin-footer">
          <Link to="/" className="back-to-site">
            <span className="nav-icon">🏠</span>
            <span>返回前台</span>
          </Link>
          <div className="admin-user">
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
      </nav>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}