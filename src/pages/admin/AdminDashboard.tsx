import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { supabase, TABLES } from '../../api/supabase';
import './AdminDashboard.css';

interface DashboardStats {
  resources: number;
  skills: number;
  courseSets: number;
  users: number;
  evaluations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    resources: 0,
    skills: 0,
    courseSets: 0,
    users: 0,
    evaluations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [resources, skills, courseSets, users, evaluations] = await Promise.all([
        supabase.from(TABLES.RESOURCES).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.SKILLS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.COURSE_SETS).select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.EVALUATIONS).select('*', { count: 'exact', head: true })
      ]);

      setStats({
        resources: resources.count || 0,
        skills: skills.count || 0,
        courseSets: courseSets.count || 0,
        users: users.count || 0,
        evaluations: evaluations.count || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header">
          <h1>📊 仪表盘</h1>
          <p>系统概览和快速操作</p>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>加载统计数据...</p>
          </div>
        ) : (
          <>
            <div className="admin-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{stats.resources}</div>
                <div className="stat-label">学习资源</div>
                <Link to="/resources" className="stat-link">查看全部 →</Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{stats.skills}</div>
                <div className="stat-label">Skills</div>
                <Link to="/skills" className="stat-link">查看排行 →</Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-value">{stats.courseSets}</div>
                <div className="stat-label">课程集</div>
                <Link to="/course-sets" className="stat-link">查看全部 →</Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.users}</div>
                <div className="stat-label">注册用户</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🛡️</div>
                <div className="stat-value">{stats.evaluations}</div>
                <div className="stat-label">评估记录</div>
              </div>
            </div>

            <div className="admin-card">
              <h2>快速操作</h2>
              <div className="quick-actions">
                <Link to="/admin/collection" className="quick-action">
                  <span className="action-icon">📥</span>
                  <span className="action-text">手动收集内容</span>
                </Link>
                <Link to="/admin/jobs" className="quick-action">
                  <span className="action-icon">⏰</span>
                  <span className="action-text">管理定时任务</span>
                </Link>
                <Link to="/admin/config" className="quick-action">
                  <span className="action-icon">⚙️</span>
                  <span className="action-text">系统配置</span>
                </Link>
                <Link to="/admin/admins" className="quick-action">
                  <span className="action-icon">👥</span>
                  <span className="action-text">管理员管理</span>
                </Link>
              </div>
            </div>

            <div className="admin-card">
              <h2>系统状态</h2>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">数据库连接</span>
                  <span className="admin-badge badge-success">正常</span>
                </div>
                <div className="status-item">
                  <span className="status-label">GitHub API</span>
                  <span className="admin-badge badge-success">正常</span>
                </div>
                <div className="status-item">
                  <span className="status-label">OpenRouter.ai</span>
                  <span className="admin-badge badge-success">正常</span>
                </div>
                <div className="status-item">
                  <span className="status-label">定时任务</span>
                  <span className="admin-badge badge-info">运行中</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}