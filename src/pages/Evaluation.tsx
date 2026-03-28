import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvaluations } from '../hooks/useUserData';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import './Evaluation.css';

export default function Evaluation() {
  const [url, setUrl] = useState('');
  const { isAuthenticated } = useAuth();
  const { evaluations, isLoading, submitEvaluation } = useEvaluations();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !isAuthenticated) return;
    
    await submitEvaluation(url);
    setUrl('');
  };
  
  const latestEvaluation = evaluations[0];
  
  return (
    <div className="evaluation">
      <SEO
        title="Claw 评估中心"
        description="提交你的 Claw 进行安全评估，获取安全检查报告、代码质量分析、依赖分析等多维度评估结果。"
        canonicalUrl="/evaluation"
        keywords="OpenClaw 安全评估, Claw 检查, AI Agent 安全, 漏洞扫描"
      />
      <Navbar />
      
      <main className="evaluation-main">
        <div className="container">
          <div className="evaluation-header">
            <h1>Claw 评估中心</h1>
            <p className="text-gray">输入 Claw 的 GitHub 仓库地址，获取安全评估与能力评分</p>
          </div>
          
          {!isAuthenticated ? (
            <div className="auth-required card">
              <div className="auth-icon">🔐</div>
              <h3>需要登录</h3>
              <p className="text-gray">登录后即可提交 Claw 进行安全评估</p>
              <Link to="/user" className="btn btn-primary">
                登录 / 注册
              </Link>
            </div>
          ) : (
            <>
              <div className="evaluation-form card">
                <form onSubmit={handleSubmit}>
                  <label htmlFor="repo-url">输入 Claw 的 GitHub 仓库地址</label>
                  <div className="input-group">
                    <input
                      id="repo-url"
                      type="text"
                      className="input"
                      placeholder="https://github.com/username/claw-repo"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading || !url}>
                      {isLoading ? '评估中...' : '提交评估'}
                    </button>
                  </div>
                </form>
                
                <div className="evaluation-note">
                  <p className="text-gray">
                    提交后，系统将分析仓库的安全性、代码质量和依赖状态
                  </p>
                </div>
              </div>
              
              {latestEvaluation && (
                <div className="evaluation-result card">
                  <h2>最新评估结果</h2>
                  
                  <div className="result-header">
                    <div className="result-info">
                      <h3>{latestEvaluation.repositoryName}</h3>
                      <p className="text-gray">
                        提交于 {new Date(latestEvaluation.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="result-status">
                      {latestEvaluation.status === 'pending' && (
                        <span className="badge badge-warning">处理中</span>
                      )}
                      {latestEvaluation.status === 'completed' && (
                        <span className="badge badge-success">已完成</span>
                      )}
                    </div>
                  </div>
                  
                  {latestEvaluation.status === 'pending' && (
                    <div className="result-pending">
                      <div className="pending-animation">
                        <div className="spinner"></div>
                        <p>正在分析中，请稍候...</p>
                      </div>
                    </div>
                  )}
                  
                  {latestEvaluation.result && (
                    <div className="result-content">
                      <div className="result-grid">
                        <div className="result-item">
                          <span className="result-label">📊 综合评分</span>
                          <span className="result-value score">
                            {latestEvaluation.result.score}/100
                          </span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">🛡️ 安全检查</span>
                          <span className={`result-value ${latestEvaluation.result.securityCheck.passed ? 'success' : 'warning'}`}>
                            {latestEvaluation.result.securityCheck.passed ? '✅ 通过' : '⚠️ 建议关注'}
                          </span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">📦 依赖总数</span>
                          <span className="result-value">
                            {latestEvaluation.result.dependencies.total}
                          </span>
                        </div>
                        <div className="result-item">
                          <span className="result-label">⚠️ 漏洞依赖</span>
                          <span className={`result-value ${latestEvaluation.result.dependencies.vulnerable > 0 ? 'error' : 'success'}`}>
                            {latestEvaluation.result.dependencies.vulnerable}
                          </span>
                        </div>
                      </div>
                      
                      <div className="result-details">
                        <div className="detail-section">
                          <h4>🔍 安全问题 ({latestEvaluation.result.securityCheck.issues.length} 项)</h4>
                          {latestEvaluation.result.securityCheck.issues.length > 0 ? (
                            <ul className="detail-list">
                              {latestEvaluation.result.securityCheck.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray">未发现安全问题</p>
                          )}
                        </div>
                        
                        <div className="detail-section">
                          <h4>💡 改进建议 ({latestEvaluation.result.securityCheck.recommendations.length} 项)</h4>
                          {latestEvaluation.result.securityCheck.recommendations.length > 0 ? (
                            <ul className="detail-list">
                              {latestEvaluation.result.securityCheck.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray">暂无建议</p>
                          )}
                        </div>

                        <div className="detail-section">
                          <h4>📝 代码质量</h4>
                          <div className="quality-info">
                            <span className="quality-score">评分: {latestEvaluation.result.codeQuality.score}/100</span>
                            {latestEvaluation.result.codeQuality.issues.length > 0 && (
                              <ul className="detail-list">
                                {latestEvaluation.result.codeQuality.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>📈 仓库活跃度</h4>
                          <div className="activity-info">
                            <span>最近提交: {new Date(latestEvaluation.result.activity.lastCommit).toLocaleDateString()}</span>
                            <span>开放 Issues: {latestEvaluation.result.activity.openIssues}</span>
                            <span>已关闭 Issues: {latestEvaluation.result.activity.closedIssues}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="result-actions">
                        <Link to="/user/evaluations" className="btn btn-secondary">
                          查看所有评估记录
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          <div className="evaluation-info">
            <h3>评估维度</h3>
            <div className="info-grid">
              <div className="info-card">
                <h4>🔍 安全检查</h4>
                <p className="text-gray">检测 API Key 泄露、依赖漏洞、配置风险</p>
              </div>
              <div className="info-card">
                <h4>⚡ 代码质量</h4>
                <p className="text-gray">分析代码结构、注释完整性</p>
              </div>
              <div className="info-card">
                <h4>📦 依赖分析</h4>
                <p className="text-gray">检查依赖安全性、版本兼容性</p>
              </div>
              <div className="info-card">
                <h4>📈 活跃度</h4>
                <p className="text-gray">分析提交频率、Issue 处理情况</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}