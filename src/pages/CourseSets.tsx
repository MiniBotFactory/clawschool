import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../hooks/useUserData';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { fetchCourseSets } from '../api/data-service';
import './CourseSets.css';

export default function CourseSets() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courseSets, setCourseSets] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();
  const { isSubscribed, toggleSubscribe } = useInteractions();

  useEffect(() => {
    fetchCourseSets().then(setCourseSets);
  }, []);
  
  const filteredSets = selectedCategory === 'all' 
    ? courseSets 
    : courseSets.filter((s: any) => s.category === selectedCategory);
  
  const categoryLabels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  };
  
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
            <p className="text-gray">由 ClawSchool 团队精心制作的系统化课程</p>
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
          
          <div className="course-sets-list">
            {filteredSets.map(set => (
              <div key={set.id} className="course-set-card card">
                <div className="course-set-header">
                  <span className="course-set-icon">{set.icon}</span>
                  <div className="course-set-info">
                    <span className="course-set-category">
                      {categoryLabels[set.category]}
                    </span>
                    <h3>{set.title}</h3>
                  </div>
                </div>
                
                <p className="course-set-desc">{set.description}</p>
                
                <div className="course-set-stats">
                  <span>{set.courses.length} 门课程</span>
                  <span>👥 {set.subscribers + (isSubscribed(set.id) ? 1 : 0)} 人订阅</span>
                </div>
                
                <div className="course-set-courses">
                  {set.courses.slice(0, 3).map((course: any, i: number) => (
                    <div key={course.id} className="mini-course">
                      <span className="mini-course-index">{i + 1}</span>
                      <span className="mini-course-title">{course.title}</span>
                    </div>
                  ))}
                  {set.courses.length > 3 && (
                    <div className="mini-course more">
                      +{set.courses.length - 3} 更多...
                    </div>
                  )}
                </div>
                
                <div className="course-set-actions">
                  <button 
                    className={`btn ${isSubscribed(set.id) ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => isAuthenticated && toggleSubscribe(set.id)}
                    disabled={!isAuthenticated}
                    title={isAuthenticated ? '' : '请先登录'}
                  >
                    {isSubscribed(set.id) ? '✅ 已订阅' : '订阅课程集'}
                  </button>
                  <button className="btn btn-secondary">查看详情</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}