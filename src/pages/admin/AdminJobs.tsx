import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { jobSchedulerApi } from '../../api/admin';
import type { ScheduledJob } from '../../api/admin';
import './AdminJobs.css';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobSchedulerApi.getAll();
      setJobs(data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (jobId: string, enabled: boolean) => {
    try {
      const result = await jobSchedulerApi.toggle(jobId, enabled);
      if (result.success) {
        setMessage({ type: 'success', text: enabled ? 'Job 已启用' : 'Job 已禁用' });
        loadJobs();
      } else {
        setMessage({ type: 'error', text: result.error || '操作失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '操作失败' });
    }
  };

  const handleTrigger = async (jobId: string) => {
    setTriggeringJob(jobId);
    setMessage(null);

    try {
      const result = await jobSchedulerApi.trigger(jobId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Job 执行成功' });
        loadJobs();
      } else {
        setMessage({ type: 'error', text: result.error || '执行失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '执行失败' });
    } finally {
      setTriggeringJob(null);
    }
  };

  const defaultJobs: ScheduledJob[] = [
    {
      id: 'collect_github',
      name: 'collect_github',
      description: '从 GitHub 收集 OpenClaw 相关仓库和 Skill',
      schedule: '0 */6 * * *',
      enabled: true,
      status: 'idle'
    },
    {
      id: 'generate_courses',
      name: 'generate_courses',
      description: '基于热门资源自动生成课程',
      schedule: '0 3 * * *',
      enabled: true,
      status: 'idle'
    },
    {
      id: 'update_rankings',
      name: 'update_rankings',
      description: '更新 Skill 排行榜',
      schedule: '0 * * * *',
      enabled: true,
      status: 'idle'
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : defaultJobs;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <span className="admin-badge badge-info">运行中</span>;
      case 'success':
        return <span className="admin-badge badge-success">成功</span>;
      case 'failed':
        return <span className="admin-badge badge-error">失败</span>;
      default:
        return <span className="admin-badge badge-info">待机</span>;
    }
  };

  const getScheduleText = (schedule: string) => {
    const parts = schedule.split(' ');
    if (parts.length !== 5) return schedule;

    const [min, hour] = parts;

    if (min.startsWith('*/')) {
      return `每 ${min.slice(2)} 小时`;
    }
    if (hour.startsWith('*/')) {
      return `每 ${hour.slice(2)} 小时`;
    }
    if (min === '0' && hour === '*') {
      return '每小时';
    }
    if (min === '0' && hour !== '*') {
      return `每天 ${hour}:00`;
    }

    return schedule;
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header">
          <h1>⏰ Job 调度</h1>
          <p>管理和监控定时任务</p>
        </div>

        {message && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>加载任务列表...</p>
          </div>
        ) : (
          <div className="admin-card">
            <h2>定时任务</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>描述</th>
                  <th>调度</th>
                  <th>状态</th>
                  <th>启用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {displayJobs.map(job => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.name}</strong>
                    </td>
                    <td>{job.description}</td>
                    <td>
                      <code>{getScheduleText(job.schedule)}</code>
                    </td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td>
                      <div
                        className={`toggle-switch ${job.enabled ? 'active' : ''}`}
                        onClick={() => handleToggle(job.id, !job.enabled)}
                      />
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleTrigger(job.id)}
                        disabled={triggeringJob === job.id || !job.enabled}
                      >
                        {triggeringJob === job.id ? '执行中...' : '手动执行'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-card">
          <h2>调度说明</h2>
          <div className="schedule-info">
            <div className="schedule-item">
              <h4>collect_github</h4>
              <p>每 6 小时从 GitHub 搜索 OpenClaw 相关仓库，使用 AI 分析资源质量并入库。</p>
            </div>
            <div className="schedule-item">
              <h4>generate_courses</h4>
              <p>每天凌晨 3 点，基于热门资源自动生成课程大纲和内容。</p>
            </div>
            <div className="schedule-item">
              <h4>update_rankings</h4>
              <p>每小时更新 Skill 排行榜，根据 Stars、下载量等指标重新排名。</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}