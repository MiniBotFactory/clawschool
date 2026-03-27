import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { systemConfigApi } from '../../api/admin';
import type { SystemConfig } from '../../api/admin';
import './AdminConfig.css';

export default function AdminConfig() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const data = await systemConfigApi.getAll();
      setConfigs(data);
    } catch (err) {
      console.error('Error loading configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await systemConfigApi.update(key, value);
      if (result.success) {
        setMessage({ type: 'success', text: '配置已更新' });
        loadConfigs();
      } else {
        setMessage({ type: 'error', text: result.error || '更新失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '更新失败' });
    } finally {
      setIsSaving(false);
    }
  };

  const defaultConfigs = [
    { key: 'llm_model', value: 'google/gemini-2.0-flash-exp:free', description: '默认 LLM 模型' },
    { key: 'content_analysis_model', value: 'google/gemini-2.0-flash-exp:free', description: '内容分析模型' },
    { key: 'course_generation_model', value: 'anthropic/claude-3.5-sonnet', description: '课程生成模型' },
    { key: 'repository_evaluation_model', value: 'anthropic/claude-3.5-sonnet', description: '仓库评估模型' },
    { key: 'chat_model', value: 'openai/gpt-4o-mini', description: '聊天对话模型' },
    { key: 'github_search_query', value: 'topic:openclaw OR topic:claw-skill', description: 'GitHub 搜索查询' },
    { key: 'github_search_limit', value: '100', description: 'GitHub 搜索结果数量限制' },
    { key: 'auto_collect_enabled', value: 'true', description: '启用自动收集' },
    { key: 'auto_course_generation', value: 'true', description: '启用自动课程生成' }
  ];

  const displayConfigs = configs.length > 0 ? configs : defaultConfigs.map(c => ({
    ...c,
    id: c.key,
    updatedAt: new Date().toISOString()
  }));

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header">
          <h1>⚙️ 系统配置</h1>
          <p>管理 LLM 模型、数据收集和其他系统设置</p>
        </div>

        {message && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>加载配置...</p>
          </div>
        ) : (
          <div className="admin-card">
            <h2>LLM 模型配置</h2>
            <div className="config-list">
              {displayConfigs.filter(c => c.key.includes('model')).map(config => (
                <div key={config.key} className="config-item">
                  <div className="config-info">
                    <label>{config.description}</label>
                    <span className="config-key">{config.key}</span>
                  </div>
                  <div className="config-value">
                    <select
                      className="admin-select"
                      value={config.value}
                      onChange={(e) => handleUpdate(config.key, e.target.value)}
                      disabled={isSaving}
                    >
                      <option value="google/gemini-2.0-flash-exp:free">Gemini Flash (免费)</option>
                      <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                      <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                      <option value="openai/gpt-4o">GPT-4o</option>
                      <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-card">
          <h2>数据收集配置</h2>
          <div className="config-list">
            {displayConfigs.filter(c => !c.key.includes('model')).map(config => (
              <div key={config.key} className="config-item">
                <div className="config-info">
                  <label>{config.description}</label>
                  <span className="config-key">{config.key}</span>
                </div>
                <div className="config-value">
                  {config.value === 'true' || config.value === 'false' ? (
                    <div
                      className={`toggle-switch ${config.value === 'true' ? 'active' : ''}`}
                      onClick={() => handleUpdate(config.key, config.value === 'true' ? 'false' : 'true')}
                    />
                  ) : (
                    <input
                      type="text"
                      className="admin-input"
                      value={config.value}
                      onChange={(e) => handleUpdate(config.key, e.target.value)}
                      disabled={isSaving}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2>环境变量</h2>
          <p className="help-text">以下配置需要在 Vercel 环境变量中设置</p>
          <div className="env-list">
            <div className="env-item">
              <span className="env-name">VITE_SUPABASE_URL</span>
              <span className="env-status">已配置</span>
            </div>
            <div className="env-item">
              <span className="env-name">VITE_SUPABASE_ANON_KEY</span>
              <span className="env-status">已配置</span>
            </div>
            <div className="env-item">
              <span className="env-name">VITE_OPENROUTER_API_KEY</span>
              <span className="env-status">已配置</span>
            </div>
            <div className="env-item">
              <span className="env-name">VITE_GITHUB_TOKEN</span>
              <span className="env-status">已配置</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}