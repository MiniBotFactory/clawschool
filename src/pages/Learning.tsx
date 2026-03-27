import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { courses, categories } from '../data/courses';
import './Learning.css';

export default function Learning() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);
  
  return (
    <div className="learning">
      <SEO
        title="学习中心"
        description="从入门到进阶，系统化学习 OpenClaw 技能，包括安装指南、基础技能、进阶技能。"
        canonicalUrl="/learning"
        keywords="OpenClaw 教程, Claw 学习, AI Agent 培训, Skill 开发课程"
      />
      <Navbar />
      
      <main className="learning-main">
        <div className="container">
          <div className="learning-header">
            <h1>学习中心</h1>
            <p className="text-gray">选择你感兴趣的课程开始学习</p>
          </div>
          
          <div className="category-filter">
            <button 
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              全部
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          
          <div className="courses-list">
            {filteredCourses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} className="course-item card">
                <div className="course-item-left">
                  <span className="course-icon">
                    {course.category === 'installation' && '📦'}
                    {course.category === 'basic' && '🔧'}
                    {course.category === 'advanced' && '🚀'}
                  </span>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>
                </div>
                <div className="course-item-right">
                  <span className="course-duration">{course.duration}</span>
                  <span className="course-status">
                    {course.progress > 0 ? `${course.progress}%` : '未开始'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}