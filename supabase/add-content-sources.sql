-- 20. 内容源表
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('github', 'youtube', 'blog', 'community', 'rss')) NOT NULL,
  url TEXT,
  description TEXT,
  search_query TEXT,
  enabled BOOLEAN DEFAULT true,
  last_collected TIMESTAMPTZ,
  collection_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_sources_type ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_content_sources_enabled ON content_sources(enabled);

DROP POLICY IF EXISTS "Anyone can read sources" ON content_sources;
DROP POLICY IF EXISTS "Admins can manage sources" ON content_sources;

CREATE POLICY "Anyone can read sources" ON content_sources FOR SELECT USING (true);
CREATE POLICY "Admins can manage sources" ON content_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update sources" ON content_sources FOR UPDATE USING (true);

ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_content_sources_updated_at ON content_sources;
CREATE TRIGGER update_content_sources_updated_at BEFORE UPDATE ON content_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 插入默认内容源
INSERT INTO content_sources (name, source_type, description, search_query, enabled) VALUES
  ('GitHub: OpenClaw', 'github', '搜索 GitHub 上的 OpenClaw 相关仓库', 'openclaw', true),
  ('GitHub: Claw Skills', 'github', '搜索 GitHub 上的 Claw Skills', 'claw-skill OR openclaw-skill', true),
  ('YouTube: OpenClaw 教程', 'youtube', '搜索 YouTube 上的 OpenClaw 教程视频', 'openclaw tutorial', true),
  ('YouTube: Claw 安装', 'youtube', '搜索 OpenClaw 安装指南', 'openclaw install guide', true),
  ('Reddit: r/openclaw', 'community', 'Reddit OpenClaw 社区', 'subreddit:openclaw', true),
  ('Reddit: r/AIAgents', 'community', 'Reddit AI Agent 社区', 'subreddit:AIAgents openclaw', true),
  ('Blog: OpenClaw 官方', 'rss', 'OpenClaw 官方博客 RSS', 'https://openclaw.dev/blog/feed.xml', true),
  ('Blog: AI Agent 开发', 'rss', 'AI Agent 开发相关博客', 'https://example.com/ai-agents/feed.xml', false)
ON CONFLICT DO NOTHING;

-- 21. OpenClaw 关键词表 (用于内容过滤)
CREATE TABLE IF NOT EXISTS openclaw_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('core', 'variant', 'related', 'tool')) NOT NULL,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO openclaw_keywords (keyword, category, weight) VALUES
  ('openclaw', 'core', 10),
  ('open claw', 'core', 10),
  ('claw', 'core', 5),
  ('claw-skill', 'core', 8),
  ('claw skill', 'core', 8),
  ('opencode', 'variant', 7),
  ('open code', 'variant', 7),
  ('claude', 'tool', 3),
  ('cursor', 'tool', 3),
  ('codex', 'tool', 3),
  ('copilot', 'tool', 3),
  ('ai agent', 'related', 2),
  ('llm agent', 'related', 2),
  ('autonomous agent', 'related', 2)
ON CONFLICT (keyword) DO NOTHING;

ALTER TABLE openclaw_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read keywords" ON openclaw_keywords FOR SELECT USING (true);