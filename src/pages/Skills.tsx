import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { fetchSkills } from '../api/data-service';
import './Skills.css';

export default function Skills() {
  const [sortBy, setSortBy] = useState<'rank' | 'stars' | 'downloads' | 'trend'>('rank');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    fetchSkills().then(setSkills);
  }, []);

  const categories = [...new Set(skills.map((s: any) => s.category))];
  
  const sortedSkills = [...skills]
    .filter((s: any) => selectedCategory === 'all' || s.category === selectedCategory)
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'stars': return b.stars - a.stars;
        case 'downloads': return b.downloads - a.downloads;
        case 'trend': return b.trend - a.trend;
        default: return a.rank - b.rank;
      }
    });
  
  return (
    <div className="skills-page">
      <SEO
        title="Skill 排行榜"
        description="发现最热门的 OpenClaw Skill，多维度排名包括 Stars、下载量、趋势等。"
        canonicalUrl="/skills"
        keywords="OpenClaw Skill, Claw 排行榜, AI Agent 插件, 最佳 Skill, 热门插件"
      />
      <Navbar />
      
      <main className="skills-main">
        <div className="container">
          <div className="skills-header">
            <h1>🏆 Skill 排行榜</h1>
            <p className="text-gray">发现最热门、最有价值的 OpenClaw Skill</p>
          </div>
          
          <div className="skills-filters">
            <div className="filter-group">
              <span className="filter-label">排序:</span>
              <select 
                className="input" 
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rank' | 'stars' | 'downloads' | 'trend')}
              >
                <option value="rank">综合排名</option>
                <option value="stars">Stars 最多</option>
                <option value="downloads">下载最多</option>
                <option value="trend">增长最快</option>
              </select>
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
          
          <div className="skills-stats">
            <span>共 {sortedSkills.length} 个 Skill</span>
            <span>数据来源: GitHub, npm, 社区</span>
          </div>
          
          <div className="skills-list">
            {sortedSkills.map((skill, index) => (
              <div key={skill.id} className="skill-card card">
                <div className="skill-rank">
                  {index < 3 ? (
                    <span className="rank-badge top3">#{index + 1}</span>
                  ) : (
                    <span className="rank-badge">#{index + 1}</span>
                  )}
                </div>
                
                <div className="skill-main">
                  <div className="skill-header">
                    <h3 className="skill-name">
                      <a href={skill.githubUrl} target="_blank" rel="noopener noreferrer">
                        {skill.name}
                      </a>
                    </h3>
                    <span className="skill-author">by {skill.author}</span>
                  </div>
                  
                  <p className="skill-desc">{skill.description}</p>
                  
                  <div className="skill-stats">
                    <div className="stat-item">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{skill.stars.toLocaleString()}</span>
                      <span className="stat-label">Stars</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📥</span>
                      <span className="stat-value">{skill.downloads.toLocaleString()}</span>
                      <span className="stat-label">下载</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">⚠️</span>
                      <span className="stat-value">{skill.issues}</span>
                      <span className="stat-label">Issues</span>
                    </div>
                    <div className="stat-item trend">
                      <span className="stat-icon">📈</span>
                      <span className={`stat-value ${skill.trend > 0 ? 'positive' : 'negative'}`}>
                        {skill.trend > 0 ? '+' : ''}{skill.trend}%
                      </span>
                      <span className="stat-label">7天增长</span>
                    </div>
                  </div>
                  
                  <div className="skill-meta">
                    <span className="skill-category">{skill.category}</span>
                    <span className="skill-update">更新: {skill.lastUpdate}</span>
                  </div>
                </div>
                
                <div className="skill-actions">
                  <a href={skill.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    查看详情
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}