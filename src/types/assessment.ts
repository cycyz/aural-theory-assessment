import { OverallLevel, MasteryStatus } from './enums';
import type { Dimension, Difficulty, SubTopic } from './enums';
import type { AnswerRecord } from './question';

/**
 * 维度评估详情
 */
export interface DimensionDetail {
  /** 维度ID */
  id: Dimension;
  /** 维度名称 */
  name: string;
  /** 维度得分 0-100 */
  score: number;
  /** 稳定等级 1-4（该维度连续答对的最高难度） */
  stableLevel: number;
  /** 掌握状态 */
  status: MasteryStatus;
  /** 答对题数 */
  correctCount: number;
  /** 总题数 */
  totalCount: number;
  /** 薄弱子知识点 */
  weakSubTopics: WeakSubTopic[];
}

/**
 * 薄弱子知识点
 */
export interface WeakSubTopic {
  /** 子知识点ID */
  id: SubTopic;
  /** 子知识点名称 */
  name: string;
  /** 答对率 */
  accuracy: number;
  /** 改进建议 */
  suggestion: string;
}

/**
 * 综合评估
 */
export interface OverallAssessment {
  /** 评估等级 */
  level: OverallLevel;
  /** 等级名称 */
  levelName: string;
  /** 加权总分 0-100 */
  score: number;
  /** 置信区间 [下限, 上限] */
  confidenceInterval: [number, number];
  /** 英皇乐理对应等级 */
  abrsmEquivalent: string;
  /** 央音音基对应等级 */
  ccomEquivalent: string;
}

/**
 * 能力画像
 */
export interface AbilityProfile {
  /** 优势项 */
  strengths: string[];
  /** 薄弱项 */
  weaknesses: string[];
  /** 学习建议 */
  recommendations: string[];
}

/**
 * 评估报告
 */
export interface AssessmentReport {
  /** 学生姓名/昵称 */
  studentName: string;
  /** 评估日期 */
  assessmentDate: string;
  /** 总用时（秒） */
  totalTimeSeconds: number;
  /** 总题数 */
  totalQuestions: number;
  /** 综合评估 */
  overall: OverallAssessment;
  /** 各维度详情 */
  dimensions: DimensionDetail[];
  /** 能力画像 */
  profile: AbilityProfile;
  /** 答题详情 */
  answerDetails: AnswerRecord[];
}

/**
 * 学生信息
 */
export interface StudentInfo {
  /** 姓名/昵称 */
  name: string;
  /** 年级（选填） */
  grade?: string;
  /** 学习乐器（选填） */
  instrument?: string;
  /** 学习音乐时长（选填） */
  studyDuration?: string;
}

/**
 * 评估配置
 */
export interface AssessmentConfig {
  /** 摸底轮每题数 */
  baselineQuestionsPerDimension: number;
  /** 自适应轮每题数 */
  adaptiveQuestionsPerDimension: number;
  /** 摸底轮初始难度 */
  baselineDifficulty: Difficulty;
  /** 总题数 */
  totalQuestions: number;
}
