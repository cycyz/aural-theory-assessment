import {
  Dimension, Difficulty, SubTopic,
  DIMENSION_SUBTOPICS,
} from '../types/enums';
import type { Question, AdaptiveState, QuestionRequest, AnswerRecord } from '../types/question';

/**
 * 自适应出题引擎
 *
 * 核心策略：
 * 1. 摸底轮：每个维度出固定难度的题（默认L2初级）
 * 2. 自适应轮：答对升难度，答错降难度
 * 3. 优先选择学生未做过的子知识点的题
 * 4. 每个维度确保覆盖不同子知识点
 */
export class AdaptiveEngine {
  private questionBank: Question[];
  private state: AdaptiveState;
  private config: {
    baselineDifficulty: Difficulty;
    minDifficulty: Difficulty;
    maxDifficulty: Difficulty;
  };

  constructor(questionBank: Question[]) {
    this.questionBank = questionBank;
    this.config = {
      baselineDifficulty: Difficulty.ELEMENTARY,
      minDifficulty: Difficulty.BEGINNER,
      maxDifficulty: Difficulty.ADVANCED,
    };

    // 初始化状态
    const currentDifficulty = {} as Record<Dimension, Difficulty>;
    const correctCount = {} as Record<Dimension, number>;
    const totalCount = {} as Record<Dimension, number>;
    const consecutiveCorrect = {} as Record<Dimension, number>;
    const subTopicStats = {} as Record<SubTopic, { correct: number; total: number }>;

    const allDimensions = Object.values(Dimension);
    for (const dim of allDimensions) {
      currentDifficulty[dim] = this.config.baselineDifficulty;
      correctCount[dim] = 0;
      totalCount[dim] = 0;
      consecutiveCorrect[dim] = 0;
    }

    const allSubTopics = Object.values(SubTopic);
    for (const st of allSubTopics) {
      subTopicStats[st] = { correct: 0, total: 0 };
    }

    this.state = {
      currentDifficulty,
      correctCount,
      totalCount,
      consecutiveCorrect,
      subTopicStats,
      usedQuestionIds: new Set(),
    };
  }

  /** 获取当前状态（用于外部读取） */
  getState(): AdaptiveState {
    return this.state;
  }

  /** 获取摸底轮题目（每维度1题，固定难度） */
  getBaselineQuestions(): Question[] {
    const questions: Question[] = [];
    const dimensions = Object.values(Dimension);

    for (const dim of dimensions) {
      const q = this.pickQuestion({
        dimension: dim,
        difficulty: this.config.baselineDifficulty,
        excludeIds: Array.from(this.state.usedQuestionIds),
      });

      if (q) {
        questions.push(q);
        this.state.usedQuestionIds.add(q.id);
      }
    }

    return questions;
  }

  /** 获取下一道自适应题目 */
  getNextQuestion(): Question | null {
    // 按轮转顺序选择维度：优先选答题数最少的维度
    const dimensions = Object.values(Dimension);
    dimensions.sort((a, b) => this.state.totalCount[a] - this.state.totalCount[b]);

    for (const dim of dimensions) {
      const currentDiff = this.state.currentDifficulty[dim];

      // 获取该维度下学生尚未做过的子知识点
      const dimSubTopics = DIMENSION_SUBTOPICS[dim];
      const weakSubTopics = this.getWeakSubTopics(dim);

      // 优先出薄弱子知识点的题
      let preferredSubTopic: SubTopic | undefined;
      if (weakSubTopics.length > 0) {
        preferredSubTopic = weakSubTopics[Math.floor(Math.random() * weakSubTopics.length)];
      } else {
        // 随机选一个还没出过的子知识点
        const unused = dimSubTopics.filter(
          st => !this.state.subTopicStats[st].total || this.state.subTopicStats[st].total < 2
        );
        if (unused.length > 0) {
          preferredSubTopic = unused[Math.floor(Math.random() * unused.length)];
        }
      }

      const q = this.pickQuestion({
        dimension: dim,
        difficulty: currentDiff,
        excludeIds: Array.from(this.state.usedQuestionIds),
        preferredSubTopic,
      });

      if (q) {
        this.state.usedQuestionIds.add(q.id);
        return q;
      }
    }

    // 如果所有维度的当前难度都没题了，降低难度再找
    for (const dim of dimensions) {
      const lowerDiff = Math.max(
        this.state.currentDifficulty[dim] - 1,
        this.config.minDifficulty
      ) as Difficulty;

      if (lowerDiff !== this.state.currentDifficulty[dim]) {
        const q = this.pickQuestion({
          dimension: dim,
          difficulty: lowerDiff,
          excludeIds: Array.from(this.state.usedQuestionIds),
        });

        if (q) {
          this.state.usedQuestionIds.add(q.id);
          return q;
        }
      }
    }

    return null; // 题库耗尽
  }

  /** 记录答题结果并更新状态 */
  recordAnswer(record: AnswerRecord): void {
    const { dimension, subTopic, difficulty, correct } = record;

    // 更新维度计数
    this.state.totalCount[dimension]++;
    if (correct) {
      this.state.correctCount[dimension]++;
      this.state.consecutiveCorrect[dimension]++;
    } else {
      this.state.consecutiveCorrect[dimension] = 0;
    }

    // 更新子知识点统计
    this.state.subTopicStats[subTopic].total++;
    if (correct) {
      this.state.subTopicStats[subTopic].correct++;
    }

    // 更新该维度当前难度
    const currentDiff = this.state.currentDifficulty[dimension];
    if (correct) {
      this.state.currentDifficulty[dimension] = Math.min(
        currentDiff + 1,
        this.config.maxDifficulty
      ) as Difficulty;
    } else {
      this.state.currentDifficulty[dimension] = Math.max(
        currentDiff - 1,
        this.config.minDifficulty
      ) as Difficulty;
    }
  }

  /** 检查是否还有可用题目 */
  hasMoreQuestions(remainingCount: number): boolean {
    if (remainingCount <= 0) return false;

    const dimensions = Object.values(Dimension);
    for (const dim of dimensions) {
      const available = this.questionBank.filter(
        q =>
          q.dimension === dim &&
          !this.state.usedQuestionIds.has(q.id)
      );
      if (available.length > 0) return true;
    }
    return false;
  }

  /** 获取某维度薄弱子知识点列表 */
  getWeakSubTopics(dimension: Dimension): SubTopic[] {
    const subTopics = DIMENSION_SUBTOPICS[dimension];
    return subTopics.filter(st => {
      const stats = this.state.subTopicStats[st];
      if (stats.total === 0) return false;
      return stats.correct / stats.total < 0.5;
    });
  }

  /** 重置引擎状态 */
  reset(): void {
    const currentDifficulty = {} as Record<Dimension, Difficulty>;
    const correctCount = {} as Record<Dimension, number>;
    const totalCount = {} as Record<Dimension, number>;
    const consecutiveCorrect = {} as Record<Dimension, number>;
    const subTopicStats = {} as Record<SubTopic, { correct: number; total: number }>;

    for (const dim of Object.values(Dimension)) {
      currentDifficulty[dim] = this.config.baselineDifficulty;
      correctCount[dim] = 0;
      totalCount[dim] = 0;
      consecutiveCorrect[dim] = 0;
    }
    for (const st of Object.values(SubTopic)) {
      subTopicStats[st] = { correct: 0, total: 0 };
    }

    this.state = {
      currentDifficulty,
      correctCount,
      totalCount,
      consecutiveCorrect,
      subTopicStats,
      usedQuestionIds: new Set(),
    };
  }

  /**
   * 从题库中选择一道题目
   */
  private pickQuestion(request: QuestionRequest): Question | null {
    const { dimension, difficulty, excludeIds, preferredSubTopic } = request;
    const excludeSet = new Set(excludeIds);

    let candidates = this.questionBank.filter(
      q =>
        q.dimension === dimension &&
        q.difficulty === difficulty &&
        !excludeSet.has(q.id)
    );

    // 如果指定了优先子知识点
    if (preferredSubTopic && candidates.some(q => q.subTopic === preferredSubTopic)) {
      candidates = candidates.filter(q => q.subTopic === preferredSubTopic);
    }

    if (candidates.length === 0) {
      // 尝试相邻难度
      for (const offset of [-1, 1, -2, 2]) {
        const altDifficulty = (difficulty + offset) as Difficulty;
        if (altDifficulty >= this.config.minDifficulty && altDifficulty <= this.config.maxDifficulty) {
          candidates = this.questionBank.filter(
            q =>
              q.dimension === dimension &&
              q.difficulty === altDifficulty &&
              !excludeSet.has(q.id)
          );
          if (candidates.length > 0) break;
        }
      }
    }

    if (candidates.length === 0) return null;

    // 随机选择
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
