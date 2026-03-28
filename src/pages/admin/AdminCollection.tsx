import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { contentCollectionApi } from '../../api/admin';
import './AdminCollection.css';

interface CollectionLog {
  id: string;
  action: string;
  status: 'success' | 'error' | 'running';
  message: string;
  timestamp: string;
}

export default function AdminCollection() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [isCollectingAll, setIsCollectingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [logs, setLogs] = useState<CollectionLog[]>([]);

  const addLog = (action: string, status: CollectionLog['status'], message: string) => {
    setLogs(prev => [{
      id: `log_${Date.now()}`,
      action,
      status,
      message,
      timestamp: new Date().toLocaleString()
    }, ...prev]);
  };

  const handleCollectGitHub = async () => {
    setIsCollecting(true);
    addLog('GitHub 收集', 'running', '正在从 GitHub 收集 OpenClaw 资源...');

    try {
      const result = await contentCollectionApi.collectGitHub();
      if (result.success) {
        addLog('GitHub 收集', 'success', `收集完成: ${result.stats?.total || 0} 条资源, ${result.stats?.errors || 0} 个错误`);
      } else {
        addLog('GitHub 收集', 'error', result.error || '收集失败');
      }
    } catch (err) {
      addLog('GitHub 收集', 'error', String(err));
    } finally {
      setIsCollecting(false);
    }
  };

  const handleCollectAllSources = async () => {
    setIsCollectingAll(true);
    addLog('多源收集', 'running', '正在从 GitHub/YouTube/博客/社区 收集...');

    try {
      const result = await contentCollectionApi.collectAllSources();
      if (result.success) {
        const s = result.stats || {};
        addLog('多源收集', 'success', `收集完成: GitHub ${s.github || 0}, YouTube ${s.youtube || 0}, 博客 ${s.blog || 0}, 社区 ${s.community || 0}`);
      } else {
        addLog('多源收集', 'error', result.error || '收集失败');
      }
    } catch (err) {
      addLog('多源收集', 'error', String(err));
    } finally {
      setIsCollectingAll(false);
    }
  };

  const handleGenerateCourses = async () => {
    setIsGenerating(true);
    addLog('课程生成', 'running', '正在使用 AI 生成课程...');

    try {
      const result = await contentCollectionApi.generateCourses();
      if (result.success) {
        addLog('课程生成', 'success', `生成完成: ${result.count || 0} 门新课程`);
      } else {
        addLog('课程生成', 'error', result.error || '生成失败');
      }
    } catch (err) {
      addLog('课程生成', 'error', String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateRankings = async () => {
    setIsUpdating(true);
    addLog('排名更新', 'running', '正在更新 Skill 排行榜...');

    try {
      const result = await contentCollectionApi.updateRankings();
      if (result.success) {
        addLog('排名更新', 'success', `更新完成: ${result.count || 0} 个 Skill 排名已更新`);
      } else {
        addLog('排名更新', 'error', result.error || '更新失败');
      }
    } catch (err) {
      addLog('排名更新', 'error', String(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: CollectionLog['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '⏳';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header">
          <h1>📥 内容收集</h1>
          <p>手动触发内容收集、课程生成、排名更新</p>
        </div>

        <div className="collection-actions">
          <div className="collection-card card">
            <div className="collection-icon">🌐</div>
            <h3>多源收集</h3>
            <p>从 GitHub、YouTube、博客、社区收集 OpenClaw 内容</p>
            <button
              className="btn btn-primary"
              onClick={handleCollectAllSources}
              disabled={isCollectingAll}
            >
              {isCollectingAll ? '收集中...' : '立即收集'}
            </button>
          </div>

          <div className="collection-card card">
            <div className="collection-icon">🐙</div>
            <h3>仅 GitHub</h3>
            <p>只从 GitHub 搜索 OpenClaw 仓库</p>
            <button
              className="btn btn-secondary"
              onClick={handleCollectGitHub}
              disabled={isCollecting}
            >
              {isCollecting ? '收集中...' : 'GitHub 收集'}
            </button>
          </div>

          <div className="collection-card card">
            <div className="collection-icon">📚</div>
            <h3>AI 课程生成</h3>
            <p>基于热门资源自动生成课程大纲</p>
            <button
              className="btn btn-success"
              onClick={handleGenerateCourses}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '立即生成'}
            </button>
          </div>

          <div className="collection-card card">
            <div className="collection-icon">🏆</div>
            <h3>排名更新</h3>
            <p>根据 Stars、下载量重新计算 Skill 排名</p>
            <button
              className="btn btn-warning"
              onClick={handleUpdateRankings}
              disabled={isUpdating}
            >
              {isUpdating ? '更新中...' : '立即更新'}
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h2>数据源列表</h2>
          <div className="sources-info">
            <div className="source-item">
              <span className="source-icon">🐙</span>
              <div className="source-details">
                <strong>GitHub</strong>
                <p className="text-gray">搜索 OpenClaw 仓库、Skills</p>
              </div>
            </div>
            <div className="source-item">
              <span className="source-icon">📺</span>
              <div className="source-details">
                <strong>YouTube</strong>
                <p className="text-gray">OpenClaw 教程、安装指南视频</p>
              </div>
            </div>
            <div className="source-item">
              <span className="source-icon">📝</span>
              <div className="source-details">
                <strong>博客 RSS</strong>
                <p className="text-gray">技术博客、官方文档更新</p>
              </div>
            </div>
            <div className="source-item">
              <span className="source-icon">💬</span>
              <div className="source-details">
                <strong>社区</strong>
                <p className="text-gray">Reddit r/openclaw, r/AIAgents</p>
              </div>
            </div>
          </div>
          <p className="text-gray" style={{ marginTop: '16px' }}>
            提示：需要配置 VITE_YOUTUBE_API_KEY 才能收集 YouTube 数据
          </p>
        </div>

        <div className="admin-card">
          <h2>操作日志</h2>
          {logs.length === 0 ? (
            <div className="empty-logs">
              <p>暂无操作记录，点击上方按钮触发内容收集</p>
            </div>
          ) : (
            <div className="log-list">
              {logs.map(log => (
                <div key={log.id} className={`log-item log-${log.status}`}>
                  <span className="log-icon">{getStatusIcon(log.status)}</span>
                  <div className="log-content">
                    <div className="log-header">
                      <strong>{log.action}</strong>
                      <span className="log-time">{log.timestamp}</span>
                    </div>
                    <p className="log-message">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}