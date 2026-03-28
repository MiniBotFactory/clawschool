-- =========================================
-- ClawSchool RLS 修复 + 数据迁移脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- =========================================

-- 1. 修复无限递归：删除旧的有问题的 RLS 策略
DROP POLICY IF EXISTS "Admins can read admin list" ON admins;
DROP POLICY IF EXISTS "Only super_admin can manage admins" ON admins;
DROP POLICY IF EXISTS "Admins can read config" ON system_config;
DROP POLICY IF EXISTS "Admins can update config" ON system_config;
DROP POLICY IF EXISTS "Admins can read jobs" ON scheduled_jobs;
DROP POLICY IF EXISTS "Admins can manage jobs" ON scheduled_jobs;

-- 2. 修复 admins 表 RLS（基于 email 字符串匹配，避免递归）
CREATE POLICY "Anyone can read admins" ON admins
  FOR SELECT USING (true);

CREATE POLICY "Super admin can insert" ON admins
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'wmango@hotmail.com'
  );

CREATE POLICY "Super admin can update" ON admins
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'wmango@hotmail.com'
  );

CREATE POLICY "Super admin can delete" ON admins
  FOR DELETE USING (
    auth.jwt() ->> 'email' = 'wmango@hotmail.com'
  );

-- 3. 修复 system_config 表 RLS
CREATE POLICY "Anyone can read config" ON system_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can update config" ON system_config
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN ('wmango@hotmail.com')
  );

-- 4. 修复 scheduled_jobs 表 RLS
CREATE POLICY "Anyone can read jobs" ON scheduled_jobs
  FOR SELECT USING (true);

CREATE POLICY "Admins can update jobs" ON scheduled_jobs
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN ('wmango@hotmail.com')
  );

-- 5. 为 evaluations 表添加公开读取（可选，管理员可能需要查看所有评估）
CREATE POLICY IF NOT EXISTS "Public read evaluations" ON evaluations
  FOR SELECT USING (true);

-- 6. 为 resources/skills/course_sets 添加写入权限（服务端收集内容用）
CREATE POLICY IF NOT EXISTS "Service can insert resources" ON resources
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service can insert skills" ON skills
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service can update skills" ON skills
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Service can insert course_sets" ON course_sets
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service can insert courses" ON courses
  FOR INSERT WITH CHECK (true);

-- 7. 插入默认管理员（确保 wmango@hotmail.com 是 super_admin）
INSERT INTO admins (email, name, role) VALUES ('wmango@hotmail.com', 'Super Admin', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', name = 'Super Admin';

-- 8. 插入默认系统配置
INSERT INTO system_config (key, value, description) VALUES
  ('llm_model', 'google/gemini-2.0-flash-exp:free', '默认 LLM 模型'),
  ('content_analysis_model', 'google/gemini-2.0-flash-exp:free', '内容分析模型'),
  ('course_generation_model', 'anthropic/claude-3.5-sonnet', '课程生成模型'),
  ('repository_evaluation_model', 'anthropic/claude-3.5-sonnet', '仓库评估模型'),
  ('chat_model', 'openai/gpt-4o-mini', '聊天对话模型'),
  ('github_search_query', 'topic:openclaw OR topic:claw-skill', 'GitHub 搜索查询'),
  ('github_search_limit', '100', 'GitHub 搜索结果数量限制'),
  ('auto_collect_enabled', 'true', '启用自动收集'),
  ('auto_course_generation', 'true', '启用自动课程生成')
ON CONFLICT (key) DO NOTHING;

-- 9. 插入默认定时任务
INSERT INTO scheduled_jobs (name, description, schedule) VALUES
  ('collect_github', '从 GitHub 收集 OpenClaw 相关仓库和 Skill', '0 */6 * * *'),
  ('generate_courses', '基于热门资源自动生成课程', '0 3 * * *'),
  ('update_rankings', '更新 Skill 排行榜', '0 * * * *')
ON CONFLICT (name) DO NOTHING;

-- 验证
SELECT 'admins' as table_name, count(*) as row_count FROM admins
UNION ALL
SELECT 'system_config', count(*) FROM system_config
UNION ALL
SELECT 'scheduled_jobs', count(*) FROM scheduled_jobs;