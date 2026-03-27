import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resources, courseSets, skills } from '../data/content';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <Navbar />
      
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>OpenClaw 一站式学习 & 聚合平台</h1>
            <p className="hero-subtitle">
              聚合全网优质学习资源，发现最热门 Skill，系统化学习 Claw 技能
            </p>
            <div className="hero-actions">
              <Link to="/resources" className="btn btn-primary">
                📚 浏览资源
              </Link>
              <Link to="/skills" className="btn btn-secondary">
                🏆 Skill 排行
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="quick-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">📚</span>
              <span className="stat-value">{resources.length}+</span>
              <span className="stat-label">聚合资源</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📖</span>
              <span className="stat-value">{courseSets.length}</span>
              <span className="stat-label">课程系列</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">{skills.length}</span>
              <span className="stat-label">上榜 Skill</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔄</span>
              <span className="stat-value">每日</span>
              <span className="stat-label">数据更新</span>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features-overview">
        <div className="container">
          <h2>平台特色</h2>
          <div className="features-grid">
            <Link to="/resources" className="feature-card card">
              <div className="feature-icon">📚</div>
              <h3>资源聚合</h3>
              <p className="text-gray">从 GitHub, YouTube, 博客聚合优质学习资源</p>
              <span className="feature-badge">{resources.length} 条资源</span>
            </Link>
            
            <Link to="/course-sets" className="feature-card card">
              <div className="feature-icon">📖</div>
              <h3>课程集</h3>
              <p className="text-gray">由 ClawSchool 团队制作的系统化课程</p>
              <span className="feature-badge">{courseSets.length} 个系列</span>
            </Link>
            
            <Link to="/skills" className="feature-card card">
              <div className="feature-icon">🏆</div>
              <h3>Skill 排行榜</h3>
              <p className="text-gray">多维度排名，发现最热门 Skill</p>
              <span className="feature-badge">{skills.length} 个 Skill</span>
            </Link>
            
            <Link to="/evaluation" className="feature-card card">
              <div className="feature-icon">🛡️</div>
              <h3>安全评估</h3>
              <p className="text-gray">一键检测 Claw 安全风险</p>
              <span className="feature-badge">模拟评估</span>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="recent-resources">
        <div className="container">
          <div className="section-header">
            <h2>最新资源</h2>
            <Link to="/resources" className="see-more">更多 →</Link>
          </div>
          <div className="resources-preview">
            {resources.slice(0, 3).map(resource => (
              <a 
                key={resource.id} 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="resource-preview card"
              >
                <span className="resource-source-badge">{resource.source}</span>
                <h3>{resource.title}</h3>
                <p className="text-gray">{resource.description.slice(0, 80)}...</p>
              </a>
            ))}
          </div>
        </div>
      </section>
      
      <section className="top-skills">
        <div className="container">
          <div className="section-header">
            <h2>Skill 热榜 Top 3</h2>
            <Link to="/skills" className="see-more">查看完整排行 →</Link>
          </div>
          <div className="skills-preview">
            {skills.slice(0, 3).map((skill, index) => (
              <div key={skill.id} className="skill-preview card">
                <div className="skill-rank-badge">
                  #{index + 1}
                </div>
                <div className="skill-info">
                  <h3>{skill.name}</h3>
                  <p className="text-gray">{skill.description}</p>
                  <div className="skill-mini-stats">
                    <span>⭐ {skill.stars}</span>
                    <span className="trend">📈 +{skill.trend}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="container">
          <p>© 2026 ClawSchool - OpenClaw 一站式学习 & 聚合平台</p>
          <p className="text-gray">数据每日更新，来源: GitHub, npm, 博客, 社区</p>
        </div>
      </footer>
    </div>
  );
}