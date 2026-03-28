import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../hooks/useUserData';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { fetchCourseSets } from '../api/data-service';
import './CourseSets.css';

export default function CourseSets() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courseSets, setCourseSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { isSubscribed, toggleSubscribe } = useInteractions();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourseSets();
  }, []);

  const loadCourseSets = async () => {
    setLoading(true);
    const data = await fetchCourseSets();
    setCourseSets(data);
    setLoading(false);
  };

  const handleSubscribe = async (courseSetId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleSubscribe(courseSetId);
  };

  const handleViewCourse = (courseSet: any) => {
    if (courseSet.courses && courseSet.courses.length > 0) {
      navigate(`/course/${courseSet.courses[0].id}`);
    } else {
      navigate(`/course-sets`);
    }
  };
  
  const filteredSets = selectedCategory === 'all' 
    ? courseSets 
    : courseSets.filter((s: any) => s.category === selectedCategory);
  
  const categoryLabels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  };

  if (loading) {
    return (
      <div className="course-sets-page">
        <Navbar />
        <main className="course-sets-main">
          <div className="container">
            <div className="loading-state">加载中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="course-sets-page">
      <SEO
        title="课程集"
        description="由 ClawSchool 团队精心制作的系统化 OpenClaw 课程，涵盖入门、进阶、高级三个层次。"
        canonicalUrl="/course-sets"
        keywords="OpenClaw 课程, Claw 学习, AI Agent 教程, Skill 开发, 安全加固"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'ClawSchool 课程集',
          description: '系统化 OpenClaw 课程系列',
          numberOfItems: courseSets.length,
          itemListElement: courseSets.map((cs, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: cs.title,
            url: `https://clawschool-five.vercel.app/course-sets#${cs.id}`
          }))
        }}
      />
      <Navbar />
      
      <main className="course-sets-main">
        <div className="container">
          <div className="course-sets-header">
            <h1>📚 课程集</h1>
            <p className="text-gray">系统化学习 OpenClaw，从入门到精通</p>
          </div>
          
          <div className="course-sets-filters">
            <button 
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              全部
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'beginner' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('beginner')}
            >
              🚀 入门
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'intermediate' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('intermediate')}
            >
              🔧 进阶
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'advanced' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('advanced')}
            >
              🛡️ 高级
            </button>
          </div>

          {filteredSets.length === 0 ? (
            <div className="empty-state card">
              <h3>暂无课程</h3>
              <p>课程正在生成中，请稍后再来...</p>
            </div>
          ) : (
            <div className="course-sets-list">
              {filteredSets.map(set => (
                <div key={set.id} className="course-set-card card">
                  <div className="course-set-header">
                    <span className="course-set-icon">{set.icon}</span>
                    <div className="course-set-info">
                      <span className="course-set-category">
                        {categoryLabels[set.category] || set.category}
                      </span>
                      <h3>{set.title}</h3>
                    </div>
                  </div>
                  
                  <p className="course-set-desc">{set.description}</p>
                  
                  <div className="course-set-stats">
                    <span>📚 {set.courses.length} 门课程</span>
                    <span>👥 {set.subscribers + (isSubscribed(set.id) ? 1 : 0)} 人订阅</span>
                  </div>
                  
                  <div className="course-set-courses">
                    {set.courses.length === 0 ? (
                      <div className="no-courses">课程内容生成中...</div>
                    ) : (
                      set.courses.slice(0, 3).map((course: any, i: number) => (
                        <Link 
                          key={course.id} 
                          to={`/course/${course.id}`}
                          className="mini-course"
                        >
                          <span className="mini-course-index">{i + 1}</span>
                          <span className="mini-course-title">{course.title}</span>
                        </Link>
                      ))
                    )}
                    {set.courses.length > 3 && (
                      <div className="mini-course more">
                        +{set.courses.length - 3} 更多...
                      </div>
                    )}
                  </div>
                  
                  <div className="course-set-actions">
                    <button 
                      className={`btn ${isSubscribed(set.id) ? 'btn-success' : 'btn-primary'}`}
                      onClick={() => handleSubscribe(set.id)}
                    >
                      {isSubscribed(set.id) ? '✅ 已订阅' : '📖 订阅课程集'}
                    </button>
                    {set.courses.length > 0 && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleViewCourse(set)}
                      >
                        开始学习 →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="course-info-section card">
            <h3>💡 如何使用课程</h3>
            <div className="steps-grid">
              <div className="step-item">
                <span className="step-number">1</span>
                <h4>订阅课程集</h4>
                <p>点击「订阅课程集」将课程加入你的学习计划</p>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <h4>开始学习</h4>
                <p>点击「开始学习」进入课程内容</p>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <h4>标记完成</h4>
                <p>学完每节课后标记「已完成」</p>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <h4>追踪进度</h4>
                <p>在「我的」页面查看学习进度</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
