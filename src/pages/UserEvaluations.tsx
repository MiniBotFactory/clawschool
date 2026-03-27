import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvaluations } from '../hooks/useUserData';
import Navbar from '../components/Navbar';
import './UserEvaluations.css';

export default function UserEvaluations() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { evaluations, refreshEvaluations } = useEvaluations();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/user');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    refreshEvaluations();
    // 定期刷新评估状态
    const interval = setInterval(refreshEvaluations, 3000);
    return () => clearInterval(interval);
  }, [refreshEvaluations]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">等待中</span>;
      case 'processing':
        return <span className="badge badge-info">处理中</span>;
      case 'completed':
        return <span className="badge badge-success">已完成</span>;
      case 'failed':
        return <span className="badge badge-error">失败</span>;
      default:
        return null;
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };
  
  return (
    <div className="user-evaluations-page">
      <Navbar />
      
      <main className="page-main">
        <div className="container">
          <div className="page-header">
            <Link to="/user" className="back-link">← 返回用户中心</Link>
            <h1>我的评估记录</h1>
            <p className="text-gray">查看你提交的所有 Claw 评估结果</p>
          </div>
          
          {evaluations.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">🛡️</div>
              <h3>还没有评估记录</h3>
              <p className="text-gray">提交你的第一个 Claw 进行安全评估</p>
              <Link to="/evaluation" className="btn btn-primary">
                开始评估
              </Link>
            </div>
          ) : (
            <div className="evaluations-list">
              {evaluations.map(evaluation => (
                <div key={evaluation.id} className="evaluation-card card">
                  <div className="evaluation-header">
                    <div className="evaluation-info">
                      <h3>{evaluation.repositoryName}</h3>
                      <p className="text-gray">
                        提交于 {new Date(evaluation.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="evaluation-status">
                      {getStatusBadge(evaluation.status)}
                    </div>
                  </div>
                  
                  {evaluation.result && (
                    <div className="evaluation-result">
                      <div className="result-summary">
                        <div className={`score-circle ${getScoreColor(evaluation.result.score)}`}>
                          <span className="score-value">{evaluation.result.score}</span>
                          <span className="score-label">分</span>
                        </div>
                      </div>
                      
                      <div className="result-details">
                        <div className="detail-section">
                          <h4>🛡️ 安全检查</h4>
                          <div className={`check-status ${evaluation.result.securityCheck.passed ? 'passed' : 'failed'}`}>
                            {evaluation.result.securityCheck.passed ? '✅ 通过' : '⚠️ 需要关注'}
                          </div>
                          {evaluation.result.securityCheck.issues.length > 0 && (
                            <ul className="detail-list">
                              {evaluation.result.securityCheck.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        
                        <div className="detail-section">
                          <h4>📦 依赖分析</h4>
                          <div className="dependency-stats">
                            <span>总计: {evaluation.result.dependencies.total}</span>
                            <span className="warning">有漏洞: {evaluation.result.dependencies.vulnerable}</span>
                            <span className="info">过期: {evaluation.result.dependencies.outdated}</span>
                          </div>
                        </div>
                        
                        <div className="detail-section">
                          <h4>💡 建议</h4>
                          <ul className="detail-list">
                            {evaluation.result.securityCheck.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {evaluation.status === 'pending' && (
                    <div className="evaluation-pending">
                      <div className="pending-spinner"></div>
                      <p>正在分析中，请稍候...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}