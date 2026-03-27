import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🦞</span>
          <span className="logo-text">ClawSchool</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/resources" className={isActive('/resources') ? 'active' : ''}>
            📚 资源库
          </Link>
          <Link to="/course-sets" className={isActive('/course-sets') ? 'active' : ''}>
            📖 课程集
          </Link>
          <Link to="/skills" className={isActive('/skills') ? 'active' : ''}>
            🏆 Skill 排行
          </Link>
          <Link to="/evaluation" className={isActive('/evaluation') ? 'active' : ''}>
            🛡️ 评估
          </Link>
        </div>
        
        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <Link to="/user" className="user-menu">
              <span className="user-avatar-small">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span className="avatar-placeholder-small">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="user-name">{user.name}</span>
            </Link>
          ) : (
            <>
              <Link to="/user" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                登录
              </Link>
              <Link to="/user" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}