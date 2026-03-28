import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../hooks/useUserData';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { fetchResources } from '../api/data-service';
import './Resources.css';

export default function Resources() {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { isLiked, isCollected, toggleLike, toggleCollect, refetch } = useInteractions();

  useEffect(() => {
    fetchResources().then(setResources);
  }, []);

  const handleToggleLike = async (resourceId: string) => {
    if (!isAuthenticated) {
      setError('请先登录');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setLoadingId(resourceId);
    setError(null);
    const result = await toggleLike(resourceId);
    if (!result.success) {
      setError(result.error || '操作失败');
      setTimeout(() => setError(null), 3000);
    }
    await refetch();
    setLoadingId(null);
  };

  const handleToggleCollect = async (resourceId: string) => {
    if (!isAuthenticated) {
      setError('请先登录');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setLoadingId(resourceId);
    setError(null);
    const result = await toggleCollect(resourceId);
    if (!result.success) {
      setError(result.error || '操作失败');
      setTimeout(() => setError(null), 3000);
    }
    await refetch();
    setLoadingId(null);
  };
  
  const filteredResources = resources.filter(r => {
    if (selectedSource !== 'all' && r.source !== selectedSource) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });
  
  const sourceIcons: Record<string, string> = {
    github: '🐙',
    youtube: '📺',
    blog: '📝',
    community: '💬'
  };
  
  const categories = [...new Set(resources.map(r => r.category))];
  
  return (
    <div className="resources-page">
      <SEO
        title="学习资源库"
        description="聚合全网优质 OpenClaw 学习资源，包括 GitHub 项目、YouTube 教程、技术博客、社区讨论。"
        canonicalUrl="/resources"
        keywords="OpenClaw 资源, Claw 教程, AI Agent 学习, OpenClaw GitHub, Claw 教程视频"
      />
      <Navbar />
      
      <main className="resources-main">
        <div className="container">
          <div className="resources-header">
            <h1>📚 学习资源库</h1>
            <p className="text-gray">聚合全网优质 OpenClaw 学习资源，帮你节省搜索时间</p>
          </div>

          {error && (
            <div className="error-message" style={{ margin: '1rem 0', padding: '0.75rem', background: '#fee', border: '1px solid #fca', borderRadius: '8px', color: '#c00' }}>
              {error}
            </div>
          )}
          
          <div className="resources-filters">
            <div className="filter-group">
              <span className="filter-label">来源:</span>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${selectedSource === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedSource('all')}
                >
                  全部
                </button>
                <button 
                  className={`filter-btn ${selectedSource === 'github' ? 'active' : ''}`}
                  onClick={() => setSelectedSource('github')}
                >
                  🐙 GitHub
                </button>
                <button 
                  className={`filter-btn ${selectedSource === 'youtube' ? 'active' : ''}`}
                  onClick={() => setSelectedSource('youtube')}
                >
                  📺 YouTube
                </button>
                <button 
                  className={`filter-btn ${selectedSource === 'blog' ? 'active' : ''}`}
                  onClick={() => setSelectedSource('blog')}
                >
                  📝 博客
                </button>
                <button 
                  className={`filter-btn ${selectedSource === 'community' ? 'active' : ''}`}
                  onClick={() => setSelectedSource('community')}
                >
                  💬 社区
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <span className="filter-label">分类:</span>
              <select 
                className="input" 
                style={{ width: 'auto' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="resources-stats">
            <span>共 {filteredResources.length} 条资源</span>
            <span>更新频率: 每日</span>
          </div>
          
          <div className="resources-list">
            {filteredResources.map(resource => (
              <div key={resource.id} className="resource-card card">
                <div className="resource-header">
                  <span className="resource-source">
                    {sourceIcons[resource.source]} {resource.source}
                  </span>
                  <span className="resource-date">{resource.publishedAt}</span>
                </div>
                
                <h3 className="resource-title">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </a>
                </h3>
                
                <p className="resource-desc">{resource.description}</p>
                
                <div className="resource-tags">
                  {resource.tags.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="resource-footer">
                  <div className="resource-stats">
                    <span>❤️ {resource.likes + (isLiked(resource.id) ? 1 : 0)}</span>
                    <span>👁️ {resource.views}</span>
                  </div>
                  <div className="resource-actions">
                    <button 
                      className={`action-btn like ${isLiked(resource.id) ? 'active' : ''} ${loadingId === resource.id ? 'loading' : ''}`}
                      onClick={() => handleToggleLike(resource.id)}
                      disabled={!isAuthenticated || loadingId === resource.id}
                      title={isAuthenticated ? '' : '请先登录'}
                    >
                      {loadingId === resource.id ? '...' : isLiked(resource.id) ? '❤️ 已赞' : '🤍 点赞'}
                    </button>
                    <button 
                      className={`action-btn collect ${isCollected(resource.id) ? 'active' : ''} ${loadingId === resource.id ? 'loading' : ''}`}
                      onClick={() => handleToggleCollect(resource.id)}
                      disabled={!isAuthenticated || loadingId === resource.id}
                      title={isAuthenticated ? '' : '请先登录'}
                    >
                      {loadingId === resource.id ? '...' : isCollected(resource.id) ? '⭐ 已收藏' : '☆ 收藏'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}