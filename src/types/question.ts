import { Dimension, Difficulty, QuestionType, SubTopic } from './enums';

/**
 * 题干内容
 */
export interface QuestionStem {
  /** 题目文字 */
  text: string;
  /** 乐谱（ABC记谱法字符串或SVG路径） */
  notation?: string;
  /** 音频文件路径 */
  audio?: string;
  /** 图片文件路径 */
  image?: string;
}

/**
 * 选项内容
 */
export interface QuestionOption {
  /** 选项ID (A/B/C/D) */
  id: string;
  /** 文字选项 */
  text?: string;
  /** 乐谱选项（ABC记谱法） */
  notation?: string;
  /** 音频选项路径 */
  audio?: string;
  /** 图片选项路径 */
  image?: string;
}

/**
 * 题目数据结构
 */
export interface Question {
  /** 唯一标识 */
  id: string;
  /** 所属维度 */
  dimension: Dimension;
  /** 子知识点 */
  subTopic: SubTopic;
  /** 难度等级 */
  difficulty: Difficulty;
  /** 题目类型 */
  type: QuestionType;
  /** 题干 */
  stem: QuestionStem;
  /** 选项列表（4个） */
  options: QuestionOption[];
  /** 正确选项ID */
  correctOptionId: string;
  /** 解析文字 */
  explanation: string;
  /** 预估答题时间（秒） */
  estimatedTimeSeconds: number;
  /** 标签（如"G2", "初级音基"等） */
  tags: string[];
}

/**
 * 答题记录
 */
export interface AnswerRecord {
  /** 题目ID */
  questionId: string;
  /** 所属维度 */
  dimension: Dimension;
  /** 子知识点 */
  subTopic: SubTopic;
  /** 题目难度 */
  difficulty: Difficulty;
  /** 是否正确 */
  correct: boolean;
  /** 学生选择的选项ID */
  selectedOptionId: string;
  /** 答题用时（秒） */
  timeSpentSeconds: number;
}

/**
 * 自适应引擎状态
 */
export interface AdaptiveState {
  /** 各维度当前难度 */
  currentDifficulty: Record<Dimension, Difficulty>;
  /** 各维度已答对题数 */
  correctCount: Record<Dimension, number>;
  /** 各维度已答总题数 */
  totalCount: Record<Dimension, number>;
  /** 各维度连续答对题数（用于稳定等级判定） */
  consecutiveCorrect: Record<Dimension, number>;
  /** 各子知识点答对/总题数 */
  subTopicStats: Record<SubTopic, { correct: number; total: number }>;
  /** 已使用的题目ID列表（避免重复） */
  usedQuestionIds: Set<string>;
}

/**
 * 出题请求
 */
export interface QuestionRequest {
  /** 目标维度 */
  dimension: Dimension;
  /** 目标难度 */
  difficulty: Difficulty;
  /** 排除的题目ID */
  excludeIds: string[];
  /** 优先子知识点（可选，用于薄弱项侧重） */
  preferredSubTopic?: SubTopic;
}
