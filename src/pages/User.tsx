import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isCurrentUserAdmin } from '../api/admin-auth';
import { fetchCourseSets } from '../api/data-service';
import { useInteractions, useCompletedCourses, useEvaluations } from '../hooks/useUserData';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import './User.css';

export default function User() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      isCurrentUserAdmin().then(setIsAdmin);
    }
  }, [isAuthenticated]);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subscribedCourseSets, setSubscribedCourseSets] = useState<any[]>([]);
  const [completedCourseSetIds, setCompletedCourseSetIds] = useState<string[]>([]);
  const [courseSets, setCourseSets] = useState<any[]>([]);

  const { isSubscribed, interactions } = useInteractions();
  const { completedCourseSets: completedIds } = useCompletedCourses();
  const { evaluations } = useEvaluations();

  useEffect(() => {
    if (isAuthenticated) {
      loadCourseSets();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (completedIds.length >= 0) {
      const subscribed = courseSets.filter(cs => isSubscribed(cs.id));
      setSubscribedCourseSets(subscribed);
      setCompletedCourseSetIds(completedIds);
    }
  }, [completedIds, courseSets, isSubscribed]);

  const loadCourseSets = async () => {
    const data = await fetchCourseSets();
    setCourseSets(data);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (isLoginMode) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || '登录失败');
        }
      } else {
        if (!name.trim()) {
          setError('请输入用户名');
          setIsSubmitting(false);
          return;
        }
        const result = await register(email, password, name);
        if (!result.success) {
          setError(result.error || '注册失败');
        }
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCompletedCount = () => completedCourseSetIds.length;
  const getSubscribedCount = () => subscribedCourseSets.length;
  
  if (isAuthenticated && user) {
    return (
      <div className="user-page">
        <SEO
          title="用户中心"
          description="管理你的学习进度、收藏资源、评估记录。"
          canonicalUrl="/user"
        />
        <Navbar />
        
        <main className="user-main">
          <div className="container">
            <div className="user-profile card">
              <div className="profile-header">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="avatar-placeholder">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="user-info">
                  <h2>{user.name}</h2>
                  <p className="text-gray">{user.email}</p>
                  <p className="user-meta">加入于 {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="user-stats">
                <div className="stat-card">
                  <span className="stat-icon">📚</span>
                  <span className="stat-value">{getCompletedCount()}</span>
                  <span className="stat-label">已完成课程</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">{getSubscribedCount()}</span>
                  <span className="stat-label">订阅课程</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-value">{interactions.filter(i => i.type === 'like').length}</span>
                  <span className="stat-label">点赞资源</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🛡️</span>
                  <span className="stat-value">{evaluations.length}</span>
                  <span className="stat-label">提交评估</span>
                </div>
              </div>
              
              <div className="user-actions">
                <Link to="/user/collections" className="btn btn-primary">
                  我的收藏
                </Link>
                <Link to="/user/evaluations" className="btn btn-secondary">
                  我的评估
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-admin">
                    ⚙️ 管理后台
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-danger">
                  退出登录
                </button>
              </div>
            </div>

            {subscribedCourseSets.length > 0 && (
              <div className="my-courses-section card">
                <h3>📖 我的订阅课程</h3>
                <div className="course-list">
                  {subscribedCourseSets.map(cs => (
                    <div key={cs.id} className="course-item">
                      <div className="course-info">
                        <span className="course-icon">{cs.icon}</span>
                        <div>
                          <Link to={`/course-sets`} className="course-title">
                            {cs.title}
                          </Link>
                          <p className="course-desc">{cs.description}</p>
                          <span className="course-meta">
                            {cs.courseCount} 门课程 • {completedCourseSetIds.includes(cs.id) ? '✅ 已完成' : '📚学习中'}
                          </span>
                        </div>
                      </div>
                      <Link to="/course-sets" className="btn btn-secondary btn-sm">
                        继续学习
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courseSets.filter(cs => completedCourseSetIds.includes(cs.id)).length > 0 && (
              <div className="my-courses-section card completed">
                <h3>🏆 已完成课程</h3>
                <div className="course-list">
                  {courseSets
                    .filter(cs => completedCourseSetIds.includes(cs.id))
                    .map(cs => (
                      <div key={cs.id} className="course-item completed">
                        <div className="course-info">
                          <span className="course-icon">{cs.icon}</span>
                          <div>
                            <Link to={`/course-sets`} className="course-title">
                              {cs.title}
                            </Link>
                            <p className="course-desc">{cs.description}</p>
                          </div>
                        </div>
                        <span className="completed-badge">✅ 完成</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            <div className="quick-links">
              <h3>快速导航</h3>
              <div className="links-grid">
                <Link to="/resources" className="link-card card">
                  <span className="link-icon">📚</span>
                  <span>资源库</span>
                </Link>
                <Link to="/course-sets" className="link-card card">
                  <span className="link-icon">📖</span>
                  <span>课程集</span>
                </Link>
                <Link to="/skills" className="link-card card">
                  <span className="link-icon">🏆</span>
                  <span>Skill 排行</span>
                </Link>
                <Link to="/evaluation" className="link-card card">
                  <span className="link-icon">🛡️</span>
                  <span>评估 Claw</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="user-page">
      <SEO
        title="登录 / 注册"
        description="登录 ClawSchool 开始你的 OpenClaw 学习之旅，记录学习进度，收藏资源，提交评估。"
        canonicalUrl="/user"
      />
      <Navbar />
      
      <main className="user-main">
        <div className="container">
          <div className="auth-card card">
            <h1>{isLoginMode ? '登录' : '注册'}</h1>
            <p className="text-gray">
              {isLoginMode 
                ? '登录后可记录学习进度，收藏资源，订阅课程，提交评估' 
                : '创建账号开始你的 OpenClaw 学习之旅'}
            </p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              {!isLoginMode && (
                <div className="form-group">
                  <label htmlFor="name">用户名</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    placeholder="请输入用户名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">邮箱</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? '处理中...' : (isLoginMode ? '登录' : '注册')}
              </button>
            </form>
            
            <div className="auth-switch">
              <p>
                {isLoginMode ? '还没有账号？' : '已有账号？'}
                <button 
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError('');
                  }}
                  className="switch-btn"
                >
                  {isLoginMode ? '立即注册' : '立即登录'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
