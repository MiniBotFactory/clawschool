import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../hooks/useUserData';
import { fetchResources, fetchCourseSets } from '../api/data-service';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import './UserCollections.css';

export default function UserCollections() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isLiked, isCollected, isSubscribed, toggleLike, toggleCollect, toggleSubscribe } = useInteractions();

  const [resources, setResources] = useState<any[]>([]);
  const [courseSets, setCourseSets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'liked' | 'collected' | 'subscribed'>('collected');
  
  useEffect(() => {
    fetchResources().then(setResources);
    fetchCourseSets().then(setCourseSets);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/user');
    }
  }, [isAuthenticated, navigate]);
  
  const likedResources = resources.filter(r => isLiked(r.id));
  const collectedResources = resources.filter(r => isCollected(r.id));
  const subscribedCourseSets = courseSets.filter(cs => isSubscribed(cs.id));
  
  const sourceIcons: Record<string, string> = {
    github: '🐙',
    youtube: '📺',
    blog: '📝',
    community: '💬'
  };
  
  return (
    <div className="user-collections-page">
      <SEO
        title="我的收藏"
        description="管理你收藏的 OpenClaw 学习资源、点赞的内容、订阅的课程系列。"
        canonicalUrl="/user/collections"
      />
      <Navbar />
      
      <main className="page-main">
        <div className="container">
          <div className="page-header">
            <Link to="/user" className="back-link">← 返回用户中心</Link>
            <h1>我的收藏</h1>
            <p className="text-gray">管理你收藏的资源和订阅的课程</p>
          </div>
          
          <div className="collections-tabs">
            <button 
              className={`tab-btn ${activeTab === 'collected' ? 'active' : ''}`}
              onClick={() => setActiveTab('collected')}
            >
              ⭐ 收藏资源 ({collectedResources.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              ❤️ 点赞资源 ({likedResources.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'subscribed' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscribed')}
            >
              📖 订阅课程 ({subscribedCourseSets.length})
            </button>
          </div>
          
          <div className="collections-content">
            {activeTab === 'collected' && (
              <>
                {collectedResources.length === 0 ? (
                  <div className="empty-state card">
                    <div className="empty-icon">⭐</div>
                    <h3>还没有收藏的资源</h3>
                    <p className="text-gray">在资源库中找到感兴趣的内容，点击收藏</p>
                    <Link to="/resources" className="btn btn-primary">
                      浏览资源
                    </Link>
                  </div>
                ) : (
                  <div className="resources-grid">
                    {collectedResources.map(resource => (
                      <div key={resource.id} className="resource-card card">
                        <div className="resource-header">
                          <span className="resource-source">
                            {sourceIcons[resource.source]} {resource.source}
                          </span>
                          <button 
                            className="action-btn collect active"
                            onClick={() => toggleCollect(resource.id)}
                          >
                            ⭐ 已收藏
                          </button>
                        </div>
                        
                        <h3 className="resource-title">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.title}
                          </a>
                        </h3>
                        
                        <p className="resource-desc">{resource.description}</p>
                        
                        <div className="resource-footer">
                          <span className="resource-stats">
                            ❤️ {resource.likes + (isLiked(resource.id) ? 1 : 0)}
                          </span>
                          <button 
                            className={`action-btn like ${isLiked(resource.id) ? 'active' : ''}`}
                            onClick={() => toggleLike(resource.id)}
                          >
                            {isLiked(resource.id) ? '❤️ 已赞' : '🤍 点赞'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'liked' && (
              <>
                {likedResources.length === 0 ? (
                  <div className="empty-state card">
                    <div className="empty-icon">❤️</div>
                    <h3>还没有点赞的资源</h3>
                    <p className="text-gray">为喜欢的资源点赞，帮助更多人发现</p>
                    <Link to="/resources" className="btn btn-primary">
                      浏览资源
                    </Link>
                  </div>
                ) : (
                  <div className="resources-grid">
                    {likedResources.map(resource => (
                      <div key={resource.id} className="resource-card card">
                        <div className="resource-header">
                          <span className="resource-source">
                            {sourceIcons[resource.source]} {resource.source}
                          </span>
                          <button 
                            className={`action-btn collect ${isCollected(resource.id) ? 'active' : ''}`}
                            onClick={() => toggleCollect(resource.id)}
                          >
                            {isCollected(resource.id) ? '⭐ 已收藏' : '☆ 收藏'}
                          </button>
                        </div>
                        
                        <h3 className="resource-title">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.title}
                          </a>
                        </h3>
                        
                        <p className="resource-desc">{resource.description}</p>
                        
                        <div className="resource-footer">
                          <span className="resource-stats">
                            ❤️ {resource.likes + 1}
                          </span>
                          <button 
                            className="action-btn like active"
                            onClick={() => toggleLike(resource.id)}
                          >
                            ❤️ 已赞
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'subscribed' && (
              <>
                {subscribedCourseSets.length === 0 ? (
                  <div className="empty-state card">
                    <div className="empty-icon">📖</div>
                    <h3>还没有订阅的课程</h3>
                    <p className="text-gray">订阅课程系列，获取最新更新</p>
                    <Link to="/course-sets" className="btn btn-primary">
                      浏览课程
                    </Link>
                  </div>
                ) : (
                  <div className="course-sets-grid">
                    {subscribedCourseSets.map(courseSet => (
                      <div key={courseSet.id} className="course-set-card card">
                        <div className="course-set-header">
                          <span className="course-set-icon">{courseSet.icon}</span>
                          <div className="course-set-info">
                            <h3>{courseSet.title}</h3>
                            <span className="course-set-category">{courseSet.category}</span>
                          </div>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleSubscribe(courseSet.id)}
                          >
                            取消订阅
                          </button>
                        </div>
                        
                        <p className="course-set-desc">{courseSet.description}</p>
                        
                        <div className="course-set-stats">
                          <span>{courseSet.courses.length} 门课程</span>
                          <span>👥 {courseSet.subscribers + 1} 人订阅</span>
                        </div>
                        
                        <div className="course-set-courses">
                          {courseSet.courses.slice(0, 3).map((course: any, i: number) => (
                            <div key={course.id} className="mini-course">
                              <span className="mini-course-index">{i + 1}</span>
                              <span className="mini-course-title">{course.title}</span>
                            </div>
                          ))}
                          {courseSet.courses.length > 3 && (
                            <div className="mini-course more">
                              +{courseSet.courses.length - 3} 更多...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}