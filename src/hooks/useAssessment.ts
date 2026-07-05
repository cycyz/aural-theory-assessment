import { useState, useCallback, useRef } from 'react';
import {
  Dimension, Difficulty, AssessmentPhase,
} from '../types/enums';
import type { Question, AnswerRecord } from '../types/question';
import type { AssessmentReport, StudentInfo, AssessmentConfig } from '../types/assessment';
import { AdaptiveEngine } from '../engine/AdaptiveEngine';
import { ReportGenerator } from '../engine/ReportGenerator';
import { questionBank } from '../data';

/** 默认评估配置 */
const DEFAULT_CONFIG: AssessmentConfig = {
  baselineQuestionsPerDimension: 1,
  adaptiveQuestionsPerDimension: 3,
  baselineDifficulty: Difficulty.ELEMENTARY,
  totalQuestions: 24, // 6(摸底) + 18(自适应)
};

/**
 * 评估流程状态管理 Hook
 *
 * 管理整个评估流程的状态机：
 * WELCOME → BASELINE → ADAPTIVE → REPORT
 */
export function useAssessment() {
  const [phase, setPhase] = useState<AssessmentPhase>(AssessmentPhase.WELCOME);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions] = useState(DEFAULT_CONFIG.totalQuestions);
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<AdaptiveEngine | null>(null);
  const reportGeneratorRef = useRef<ReportGenerator>(new ReportGenerator());
  const startTimeRef = useRef<number>(0);
  const questionStartTimeRef = useRef<number>(0);

  /** 初始化引擎 */
  const initEngine = useCallback(() => {
    engineRef.current = new AdaptiveEngine(questionBank);
  }, []);

  /** 开始评估 */
  const startAssessment = useCallback((info: StudentInfo) => {
    setStudentInfo(info);
    setIsLoading(true);
    setError(null);

    try {
      initEngine();
      startTimeRef.current = Date.now();

      // 获取摸底轮题目
      const baselineQuestions = engineRef.current!.getBaselineQuestions();

      if (baselineQuestions.length === 0) {
        setError('题库中没有足够的题目，请先填充题库。');
        setIsLoading(false);
        return;
      }

      setCurrentQuestion(baselineQuestions[0]);
      setQuestionIndex(1);
      setPhase(AssessmentPhase.BASELINE);
      questionStartTimeRef.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : '初始化评估失败');
    }

    setIsLoading(false);
  }, [initEngine]);

  /** 提交答案 */
  const submitAnswer = useCallback((selectedOptionId: string) => {
    if (!currentQuestion || !engineRef.current) return;

    const timeSpent = (Date.now() - questionStartTimeRef.current) / 1000;
    const correct = selectedOptionId === currentQuestion.correctOptionId;

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      subTopic: currentQuestion.subTopic,
      difficulty: currentQuestion.difficulty,
      correct,
      selectedOptionId,
      timeSpentSeconds: timeSpent,
    };

    // 记录答题结果
    engineRef.current.recordAnswer(record);
    setAnswerRecords(prev => [...prev, record]);

    // 获取下一题
    let nextQuestion: Question | null = null;

    if (phase === AssessmentPhase.BASELINE) {
      // 摸底轮：继续出下一维度的题
      const remaining = engineRef.current.getBaselineQuestions();
      // baseline已经取过了，需要从状态中获取未使用的
      const allDimensions = Object.values(Dimension);
      const usedDims = new Set(answerRecords.concat(record).map(r => r.dimension));

      for (const dim of allDimensions) {
        if (!usedDims.has(dim)) {
          // 通过 engine 的私有方法逻辑来找下一题
          break;
        }
      }

      if (questionIndex < DEFAULT_CONFIG.baselineQuestionsPerDimension * 6) {
        // 还有摸底轮题目
        const next = engineRef.current.getNextQuestion();
        if (next) {
          nextQuestion = next;
          setQuestionIndex(prev => prev + 1);
        }
      }

      if (!nextQuestion) {
        // 摸底轮结束，进入自适应轮
        setPhase(AssessmentPhase.ADAPTIVE);
        const adaptiveQ = engineRef.current.getNextQuestion();
        if (adaptiveQ) {
          nextQuestion = adaptiveQ;
          setQuestionIndex(prev => prev + 1);
        }
      }
    } else if (phase === AssessmentPhase.ADAPTIVE) {
      if (questionIndex < DEFAULT_CONFIG.totalQuestions) {
        nextQuestion = engineRef.current.getNextQuestion();
        if (nextQuestion) {
          setQuestionIndex(prev => prev + 1);
        }
      }
    }

    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      questionStartTimeRef.current = Date.now();
    } else {
      // 所有题目完成，生成报告
      finishAssessment();
    }
  }, [currentQuestion, phase, questionIndex, answerRecords]);

  /** 完成评估，生成报告 */
  const finishAssessment = useCallback(() => {
    const totalTime = (Date.now() - startTimeRef.current) / 1000;
    const allRecords = answerRecords;
    const generatedReport = reportGeneratorRef.current.generateReport(
      studentInfo,
      allRecords,
      totalTime
    );
    setReport(generatedReport);
    setPhase(AssessmentPhase.REPORT);
    setCurrentQuestion(null);
  }, [answerRecords, studentInfo]);

  /** 重新开始 */
  const restart = useCallback(() => {
    setPhase(AssessmentPhase.WELCOME);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setAnswerRecords([]);
    setReport(null);
    setError(null);
    engineRef.current = null;
  }, []);

  /** 获取当前进度 */
  const getProgress = useCallback(() => {
    return {
      current: questionIndex,
      total: totalQuestions,
      percentage: Math.round((questionIndex / totalQuestions) * 100),
    };
  }, [questionIndex, totalQuestions]);

  return {
    // 状态
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    answerRecords,
    report,
    studentInfo,
    isLoading,
    error,

    // 方法
    startAssessment,
    submitAnswer,
    restart,
    getProgress,
  };
}
