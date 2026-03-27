// ClawSchool LLM 配置文件
// 支持通过环境变量或代码配置模型

// ==================== 环境变量配置（推荐） ====================
// 在 .env 文件中设置以下变量：
// VITE_DEFAULT_LLM_MODEL=google/gemini-2.0-flash-exp:free
// VITE_CONTENT_ANALYSIS_MODEL=google/gemini-2.0-flash-exp:free
// VITE_COURSE_GENERATION_MODEL=anthropic/claude-3.5-sonnet
// VITE_REPOSITORY_EVALUATION_MODEL=anthropic/claude-3.5-sonnet
// VITE_CHAT_MODEL=openai/gpt-4o-mini

// ==================== 可用模型列表 ====================
export const AVAILABLE_MODELS = {
  // 🆓 免费模型（推荐先用这些测试）
  'gemini-flash-free': 'google/gemini-2.0-flash-exp:free',
  
  // 💰 付费模型（按价格从低到高）
  'gpt4o-mini': 'openai/gpt-4o-mini',
  'claude-haiku': 'anthropic/claude-3-haiku',
  'gpt4o': 'openai/gpt-4o',
  'gemini-pro': 'google/gemini-pro-1.5',
  'claude-sonnet': 'anthropic/claude-3.5-sonnet'
} as const;

// ==================== 默认模型配置 ====================
export const LLM_CONFIG = {
  // 默认模型（用于所有任务，除非单独指定）
  DEFAULT: import.meta.env.VITE_DEFAULT_LLM_MODEL || 'google/gemini-2.0-flash-exp:free',
  
  // 内容分析（资源质量评估、分类）
  CONTENT_ANALYSIS: import.meta.env.VITE_CONTENT_ANALYSIS_MODEL || 'google/gemini-2.0-flash-exp:free',
  
  // 课程生成（大纲、内容）
  COURSE_GENERATION: import.meta.env.VITE_COURSE_GENERATION_MODEL || 'anthropic/claude-3.5-sonnet',
  
  // 仓库评估（安全分析、代码质量）
  REPOSITORY_EVALUATION: import.meta.env.VITE_REPOSITORY_EVALUATION_MODEL || 'anthropic/claude-3.5-sonnet',
  
  // 聊天对话（用户交互）
  CHAT: import.meta.env.VITE_CHAT_MODEL || 'openai/gpt-4o-mini',
  
  // ==================== 参数设置 ====================
  TEMPERATURE: {
    CONTENT_ANALYSIS: 0.3,      // 低温度，更准确
    COURSE_GENERATION: 0.7,     // 中等温度，平衡创意和准确
    REPOSITORY_EVALUATION: 0.3, // 低温度，更准确
    CHAT: 0.8                   // 高温度，更自然
  },
  
  // 最大输出 tokens
  MAX_TOKENS: {
    CONTENT_ANALYSIS: 1000,
    COURSE_GENERATION: 4096,
    REPOSITORY_EVALUATION: 2000,
    CHAT: 2048
  }
} as const;

// 获取指定任务的模型配置
export function getModelConfig(task: keyof typeof LLM_CONFIG.TEMPERATURE) {
  return {
    model: LLM_CONFIG[task],
    temperature: LLM_CONFIG.TEMPERATURE[task],
    maxTokens: LLM_CONFIG.MAX_TOKENS[task]
  };
}

// 导出便捷函数
export const getContentAnalysisModel = () => getModelConfig('CONTENT_ANALYSIS');
export const getCourseGenerationModel = () => getModelConfig('COURSE_GENERATION');
export const getRepositoryEvaluationModel = () => getModelConfig('REPOSITORY_EVALUATION');
export const getChatModel = () => getModelConfig('CHAT');

// 显示当前配置（用于调试）
export function getCurrentConfig() {
  return {
    default: LLM_CONFIG.DEFAULT,
    contentAnalysis: LLM_CONFIG.CONTENT_ANALYSIS,
    courseGeneration: LLM_CONFIG.COURSE_GENERATION,
    repositoryEvaluation: LLM_CONFIG.REPOSITORY_EVALUATION,
    chat: LLM_CONFIG.CHAT
  };
}