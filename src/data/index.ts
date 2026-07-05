import { questionsD1 } from './questions-d1';
import { questionsD2 } from './questions-d2';
import { questionsD3 } from './questions-d3';
import { questionsD4 } from './questions-d4';
import { questionsD5 } from './questions-d5';
import { questionsD6 } from './questions-d6';
import type { Question } from '../types/question';

/**
 * 完整题库
 * 汇总所有六个维度的题目
 */
export const questionBank: Question[] = [
  ...questionsD1,
  ...questionsD2,
  ...questionsD3,
  ...questionsD4,
  ...questionsD5,
  ...questionsD6,
];

/** 按维度获取题目 */
export function getQuestionsByDimension(dimension: string): Question[] {
  return questionBank.filter(q => q.dimension === dimension);
}

/** 按难度获取题目 */
export function getQuestionsByDifficulty(difficulty: number): Question[] {
  return questionBank.filter(q => q.difficulty === difficulty);
}

/** 题库统计 */
export function getQuestionStats() {
  const stats = {
    total: questionBank.length,
    byDimension: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
  };

  for (const q of questionBank) {
    stats.byDimension[q.dimension] = (stats.byDimension[q.dimension] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
  }

  return stats;
}

export { questionsD1, questionsD2, questionsD3, questionsD4, questionsD5, questionsD6 };
