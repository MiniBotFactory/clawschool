import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { contentSourcesApi, contentCollectionApi, type ContentSource } from '../../api/admin';
import './AdminCollection.css';

interface CollectionLog {
  id: string;
  action: string;
  status: 'success' | 'error' | 'running';
  message: string;
  timestamp: string;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  github: '🐙 GitHub',
  youtube: '📺 YouTube',
  rss: '📝 RSS 博客',
  community: '💬 社区'
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  github: '#333',
  youtube: '#FF0000',
  rss: '#FF6600',
  community: '#FF4500'
};

export default function AdminCollection() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [isCollectingAll, setIsCollectingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [logs, setLogs] = useState<CollectionLog[]>([]);

  const [sources, setSources] = useState<ContentSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<ContentSource | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setIsLoadingSources(true);
    const data = await contentSourcesApi.getAll();
    setSources(data);
    setIsLoadingSources(false);
  };

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
    addLog('多源收集', 'running', '正在从所有数据源收集...');

    try {
      const result = await contentCollectionApi.collectAllSources();
      if (result.success) {
        const s = result.stats || {};
        addLog('多源收集', 'success', `收集完成: GitHub ${s.github || 0}, YouTube ${s.youtube || 0}, 博客 ${s.blog || 0}, 社区 ${s.community || 0}`);
        await loadSources();
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

  const handleDeleteSource = async (id: string) => {
    if (!confirm('确定要删除这个数据源吗？')) return;
    const result = await contentSourcesApi.delete(id);
    if (result.success) {
      await loadSources();
      addLog('删除数据源', 'success', '数据源已删除');
    } else {
      addLog('删除数据源', 'error', result.error || '删除失败');
    }
  };

  const handleToggleSource = async (source: ContentSource) => {
    const result = await contentSourcesApi.update(source.id, { enabled: !source.enabled });
    if (result.success) {
      await loadSources();
    }
  };

  const getStatusIcon = (status: CollectionLog['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '⏳';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header">
          <h1>📥 内容收集</h1>
          <p>管理数据源，手动触发内容收集、课程生成、排名更新</p>
        </div>

        <div className="collection-actions">
          <div className="collection-card card">
            <div className="collection-icon">🌐</div>
            <h3>多源收集</h3>
            <p>从所有已配置的数据源收集内容</p>
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
            <p>基于热门资源自动生成课程</p>
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
            <p>根据 Stars、下载量重新计算排名</p>
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
          <div className="sources-header">
            <h2>📊 数据源列表</h2>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              + 添加数据源
            </button>
          </div>

          {isLoadingSources ? (
            <div className="loading-state">加载中...</div>
          ) : (
            <div className="sources-table-wrapper">
              <table className="sources-table">
                <thead>
                  <tr>
                    <th>状态</th>
                    <th>数据源</th>
                    <th>类型</th>
                    <th>搜索词 / URL</th>
                    <th>已收集</th>
                    <th>上次收集</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map(source => (
                    <tr key={source.id} className={!source.enabled ? 'disabled' : ''}>
                      <td>
                        <button
                          className={`toggle-btn ${source.enabled ? 'active' : ''}`}
                          onClick={() => handleToggleSource(source)}
                          title={source.enabled ? '点击禁用' : '点击启用'}
                        >
                          {source.enabled ? '🟢' : '⚫'}
                        </button>
                      </td>
                      <td>
                        <div className="source-name">{source.name}</div>
                        <div className="source-desc">{source.description || '-'}</div>
                      </td>
                      <td>
                        <span
                          className="source-type-badge"
                          style={{ backgroundColor: SOURCE_TYPE_COLORS[source.sourceType] }}
                        >
                          {SOURCE_TYPE_LABELS[source.sourceType]}
                        </span>
                      </td>
                      <td>
                        <div className="source-query">
                          {source.searchQuery || source.url || '-'}
                        </div>
                      </td>
                      <td>
                        <span className="items-count">{source.collectionCount}</span>
                      </td>
                      <td>
                        <span className="last-collected">{formatDate(source.lastCollectedAt)}</span>
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => setEditingSource(source)}
                          title="编辑"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteSource(source.id)}
                          title="删除"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="sources-summary">
            <span>共 {sources.length} 个数据源</span>
            <span>•</span>
            <span>已启用 {sources.filter(s => s.enabled).length} 个</span>
            <span>•</span>
            <span>累计收集 {sources.reduce((sum, s) => sum + s.collectionCount, 0)} 条内容</span>
          </div>
        </div>

        <div className="admin-card">
          <h2>📋 数据源类型说明</h2>
          <div className="source-types-grid">
            <div className="source-type-card">
              <div className="source-type-icon" style={{ backgroundColor: '#333' }}>🐙</div>
              <h4>GitHub</h4>
              <p>通过 GitHub API 搜索 OpenClaw 相关仓库和 Skills</p>
              <ul>
                <li>搜索词: openclaw, claw-skill, claw-plugin</li>
                <li>支持按 Stars 排序</li>
                <li>自动提取仓库描述和 Topics</li>
              </ul>
            </div>
            <div className="source-type-card">
              <div className="source-type-icon" style={{ backgroundColor: '#FF0000' }}>📺</div>
              <h4>YouTube</h4>
              <p>收集 OpenClaw 教程和安装指南视频</p>
              <ul>
                <li>需要配置 VITE_YOUTUBE_API_KEY</li>
                <li>按相关性搜索</li>
                <li>自动提取视频标题和描述</li>
              </ul>
            </div>
            <div className="source-type-card">
              <div className="source-type-icon" style={{ backgroundColor: '#FF6600' }}>📝</div>
              <h4>RSS 博客</h4>
              <p>通过 RSS 订阅技术博客更新</p>
              <ul>
                <li>需要提供完整的 RSS URL</li>
                <li>支持任何使用 RSS 的网站</li>
                <li>自动过滤相关内容</li>
              </ul>
            </div>
            <div className="source-type-card">
              <div className="source-type-icon" style={{ backgroundColor: '#FF4500' }}>💬</div>
              <h4>社区</h4>
              <p>从 Reddit 等社区收集讨论</p>
              <ul>
                <li>支持 Reddit r/openclaw</li>
                <li>按相关性排序</li>
                <li>自动提取评分和评论</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2>📝 操作日志</h2>
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

      {(showAddModal || editingSource) && (
        <SourceModal
          source={editingSource}
          onClose={() => {
            setShowAddModal(false);
            setEditingSource(null);
          }}
          onSave={async () => {
            setShowAddModal(false);
            setEditingSource(null);
            await loadSources();
          }}
        />
      )}
    </AdminLayout>
  );
}

interface SourceModalProps {
  source: ContentSource | null;
  onClose: () => void;
  onSave: () => void;
}

function SourceModal({ source, onClose, onSave }: SourceModalProps) {
  const [name, setName] = useState(source?.name || '');
  const [sourceType, setSourceType] = useState<ContentSource['sourceType']>(source?.sourceType || 'github');
  const [url, setUrl] = useState(source?.url || '');
  const [description, setDescription] = useState(source?.description || '');
  const [searchQuery, setSearchQuery] = useState(source?.searchQuery || '');
  const [enabled, setEnabled] = useState(source?.enabled ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = {
      name,
      sourceType,
      url: url || undefined,
      description: description || undefined,
      searchQuery: searchQuery || undefined,
      enabled
    };

    let result;
    if (source) {
      result = await contentSourcesApi.update(source.id, data);
    } else {
      result = await contentSourcesApi.create(data);
    }

    setIsSaving(false);

    if (result.success) {
      onSave();
    } else {
      alert(result.error || '保存失败');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{source ? '✏️ 编辑数据源' : '➕ 添加数据源'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如: GitHub - OpenClaw 主仓库"
              required
            />
          </div>

          <div className="form-group">
            <label>类型 *</label>
            <select
              value={sourceType}
              onChange={e => setSourceType(e.target.value as ContentSource['sourceType'])}
            >
              <option value="github">🐙 GitHub</option>
              <option value="youtube">📺 YouTube</option>
              <option value="rss">📝 RSS 博客</option>
              <option value="community">💬 社区</option>
            </select>
          </div>

          <div className="form-group">
            <label>描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="例如: 搜索 GitHub 上的 OpenClaw 相关仓库"
            />
          </div>

          {sourceType === 'github' || sourceType === 'youtube' || sourceType === 'community' ? (
            <div className="form-group">
              <label>搜索词</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  sourceType === 'github' ? '例如: openclaw, claw-skill' :
                  sourceType === 'youtube' ? '例如: openclaw tutorial' :
                  '例如: openclaw'
                }
              />
            </div>
          ) : (
            <div className="form-group">
              <label>RSS URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="例如: https://example.com/feed.xml"
              />
            </div>
          )}

          <div className="form-group form-check">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
            />
            <label htmlFor="enabled">启用此数据源</label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
