-- ClawSchool 种子数据
-- 在 Supabase SQL Editor 中执行

INSERT INTO resources (title, description, url, source, category, likes, views, published_at, tags) VALUES
('OpenClaw 安装完全指南 (2026)', '从零开始在 Mac/Windows/Linux 上安装 OpenClaw，包括常见问题解决方案', 'https://github.com/openclaw/openclaw#readme', 'github', 'installation', 245, 12000, '2026-02-15', ARRAY['installation','beginner','guide']),
('如何创建你的第一个 OpenClaw Agent', '手把手教你从零创建一个 AI Agent，包含完整示例代码', 'https://www.youtube.com/watch?v=example1', 'youtube', 'getting-started', 189, 8500, '2026-03-01', ARRAY['beginner','tutorial','video']),
('OpenClaw Skill 开发实战', '深入学习如何开发高质量的 Claw Skill', 'https://example.com/blog/skill-dev', 'blog', 'skill-development', 156, 6800, '2026-03-10', ARRAY['advanced','skill','development']),
('OpenClaw 安全加固最佳实践', '保护你的 OpenClaw 免受攻击的完整指南', 'https://www.bitdoze.com/openclaw-security-guide/', 'blog', 'security', 312, 15000, '2026-02-20', ARRAY['security','best-practices','enterprise']),
('OpenClaw + GitHub Copilot 集成教程', '如何将 OpenClaw 与 GitHub Copilot 结合使用', 'https://www.youtube.com/watch?v=example2', 'youtube', 'integration', 98, 4200, '2026-03-15', ARRAY['integration','copilot','github']),
('多 Agent 编排：OpenClaw 实战', '学习如何使用 OpenClaw 编排多个 Agent 协同工作', 'https://example.com/blog/multi-agent', 'blog', 'advanced', 145, 5900, '2026-03-05', ARRAY['advanced','multi-agent','orchestration']),
('OpenClaw Troubleshooting 社区讨论', 'Reddit 社区关于 OpenClaw 常见问题的讨论', 'https://reddit.com/r/AiForSmallBusiness/example', 'community', 'troubleshooting', 78, 3100, '2026-03-18', ARRAY['troubleshooting','community','help']),
('OpenClaw 自动化工作流指南', '使用 OpenClaw 创建自动化任务和工作流', 'https://github.com/example/automation-workflows', 'github', 'automation', 201, 9800, '2026-03-12', ARRAY['automation','workflow','advanced']),
('OpenClaw 企业级部署方案', '为大型企业环境设计的 OpenClaw 部署方案', 'https://www.cisco.com/blog/openclaw-enterprise', 'blog', 'enterprise', 89, 2800, '2026-03-20', ARRAY['enterprise','deployment','security']),
('OpenClaw 配置文件完全解析', '深入理解 openclaw.json 的每一个配置项', 'https://www.youtube.com/watch?v=example3', 'youtube', 'configuration', 167, 7200, '2026-03-08', ARRAY['configuration','intermediate','tutorial'])
ON CONFLICT (url) DO UPDATE SET
  likes = EXCLUDED.likes, views = EXCLUDED.views, updated_at = NOW();

INSERT INTO skills (name, description, author, github_url, stars, downloads, issues, last_update, trend, rank, category) VALUES
('github-integration', '将 OpenClaw 与 GitHub 深度集成', 'openclaw-contributors', 'https://github.com/openclaw-contributors/skill-github', 1247, 45230, 12, '2026-03-25', 15.2, 1, 'integration'),
('file-system-tools', '扩展文件系统操作能力', 'openclaw-contributors', 'https://github.com/openclaw-contributors/skill-fs', 987, 38560, 8, '2026-03-24', 12.8, 2, 'core'),
('code-execution', '安全的代码执行环境', 'security-team', 'https://github.com/security-team/skill-execution', 856, 32100, 5, '2026-03-23', 18.5, 3, 'execution'),
('web-search', '实时网络搜索能力', 'web-tools', 'https://github.com/web-tools/skill-search', 745, 28900, 15, '2026-03-22', 22.3, 4, 'search'),
('database-connector', '连接各种数据库', 'data-team', 'https://github.com/data-team/skill-db', 623, 24500, 9, '2026-03-21', 8.7, 5, 'data'),
('api-gateway', 'API 网关集成', 'api-team', 'https://github.com/api-team/skill-gateway', 589, 22300, 11, '2026-03-20', 10.1, 6, 'integration'),
('docker-integration', 'Docker 容器化操作', 'devops-team', 'https://github.com/devops-team/skill-docker', 512, 19800, 6, '2026-03-19', 14.2, 7, 'devops'),
('slack-notifications', 'Slack 集成与通知', 'communication-tools', 'https://github.com/communication-tools/skill-slack', 478, 18200, 7, '2026-03-18', 9.5, 8, 'communication'),
('email-sender', '邮件发送能力', 'email-team', 'https://github.com/email-team/skill-mail', 445, 17100, 4, '2026-03-17', 7.8, 9, 'communication'),
('task-scheduler', '定时任务调度', 'scheduler-team', 'https://github.com/scheduler-team/skill-cron', 412, 15800, 3, '2026-03-16', 11.4, 10, 'automation')
ON CONFLICT (name) DO UPDATE SET
  stars = EXCLUDED.stars, downloads = EXCLUDED.downloads, trend = EXCLUDED.trend, rank = EXCLUDED.rank, updated_at = NOW();

INSERT INTO course_sets (title, description, icon, category, subscribers) VALUES
('OpenClaw 入门系列', '从零开始学习 OpenClaw，适合完全没有经验的初学者', '🚀', 'beginner', 1250),
('Skill 开发实战系列', '学习如何为 OpenClaw 开发高质量的 Skill', '🔧', 'intermediate', 890),
('安全加固系列', '学习如何保护你的 OpenClaw 免受攻击', '🛡️', 'advanced', 560),
('企业级部署系列', '面向企业用户的 OpenClaw 部署与管理', '🏢', 'advanced', 320)
ON CONFLICT (title) DO UPDATE SET subscribers = EXCLUDED.subscribers;

-- 验证
SELECT 'resources' as tbl, count(*) FROM resources
UNION ALL SELECT 'skills', count(*) FROM skills
UNION ALL SELECT 'course_sets', count(*) FROM course_sets;