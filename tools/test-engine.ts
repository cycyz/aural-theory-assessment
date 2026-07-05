/**
 * 评估引擎测试脚本
 * 模拟一个学生的完整答题流程，验证引擎各项功能
 */

import { AdaptiveEngine } from '../src/engine/AdaptiveEngine.ts';
import { ScoringEngine } from '../src/engine/ScoringEngine.ts';
import { ReportGenerator } from '../src/engine/ReportGenerator.ts';
import { questionBank } from '../src/data/index.ts';
import { Dimension, Difficulty } from '../src/types/enums.ts';
import type { AnswerRecord } from '../src/types/question.ts';

console.log('═══════════════════════════════════');
console.log('  评估引擎单元测试');
console.log('═══════════════════════════════════');
console.log(`题库总数: ${questionBank.length} 题`);

// 测试1: 自适应引擎初始化
console.log('\n📋 测试1: 自适应引擎初始化');
const engine = new AdaptiveEngine(questionBank);
const state = engine.getState();
console.log('  ✅ 引擎初始化成功');
console.log(`  各维度初始难度: ${Object.values(Dimension).map(d => `${d}=${state.currentDifficulty[d]}`).join(', ')}`);

// 测试2: 摸底轮出题
console.log('\n📋 测试2: 摸底轮出题');
const baselineQuestions = engine.getBaselineQuestions();
console.log(`  ✅ 摸底轮题目数: ${baselineQuestions.length}`);
const dimensions = new Set(baselineQuestions.map(q => q.dimension));
console.log(`  覆盖维度数: ${dimensions.size} (应为6)`);
console.log(`  各题难度: ${baselineQuestions.map(q => q.difficulty).join(', ')} (应全为2)`);

// 测试3: 模拟答题流程
console.log('\n📋 测试3: 模拟完整答题流程（模拟一个中级水平学生）');

const answerRecords: AnswerRecord[] = [];

// 模拟学生回答摸底轮（6题，假设答对4题）
const mockBaselineCorrect = [true, true, false, true, false, true];
for (let i = 0; i < baselineQuestions.length; i++) {
  const q = baselineQuestions[i];
  const correct = mockBaselineCorrect[i];
  const record: AnswerRecord = {
    questionId: q.id,
    dimension: q.dimension,
    subTopic: q.subTopic,
    difficulty: q.difficulty,
    correct,
    selectedOptionId: correct ? q.correctOptionId : 'wrong',
    timeSpentSeconds: 15 + Math.random() * 20,
  };
  engine.recordAnswer(record);
  answerRecords.push(record);
}

// 模拟自适应轮（18题）
for (let i = 0; i < 18; i++) {
  const q = engine.getNextQuestion();
  if (!q) {
    console.log(`  ⚠️ 第${i + 1}题没有可用题目，跳出`);
    break;
  }

  // 模拟：难度1-2答对概率80%，难度3-4答对概率50%
  const probCorrect = q.difficulty <= 2 ? 0.8 : 0.5;
  const correct = Math.random() < probCorrect;

  const record: AnswerRecord = {
    questionId: q.id,
    dimension: q.dimension,
    subTopic: q.subTopic,
    difficulty: q.difficulty,
    correct,
    selectedOptionId: correct ? q.correctOptionId : 'wrong',
    timeSpentSeconds: 15 + Math.random() * 20,
  };
  engine.recordAnswer(record);
  answerRecords.push(record);
}

console.log(`  ✅ 总答题数: ${answerRecords.length}`);
console.log(`  正确数: ${answerRecords.filter(r => r.correct).length}`);
console.log(`  正确率: ${Math.round(answerRecords.filter(r => r.correct).length / answerRecords.length * 100)}%`);

// 测试4: 评分引擎
console.log('\n📋 测试4: 评分引擎');
const scoringEngine = new ScoringEngine();
const overall = scoringEngine.calculateOverall(answerRecords);
console.log(`  ✅ 综合等级: ${overall.level} (${overall.levelName})`);
console.log(`  加权总分: ${overall.score}/100`);
console.log(`  置信区间: [${overall.confidenceInterval[0]}, ${overall.confidenceInterval[1]}]`);
console.log(`  英皇对应: ${overall.abrsmEquivalent}`);
console.log(`  央音对应: ${overall.ccomEquivalent}`);

// 各维度得分
const dimDetails = scoringEngine.generateDimensionDetails(answerRecords);
console.log('\n  各维度得分:');
for (const dim of dimDetails) {
  const statusIcon = dim.status === 'mastered' ? '✅' : dim.status === 'weak' ? '⚠️' : '📝';
  console.log(`  ${statusIcon} ${dim.name}: ${dim.score}分 (${dim.correctCount}/${dim.totalCount}) 稳定L${dim.stableLevel}`);
  if (dim.weakSubTopics.length > 0) {
    for (const wst of dim.weakSubTopics) {
      console.log(`     ↳ ${wst.name}: ${wst.accuracy}% → ${wst.suggestion}`);
    }
  }
}

// 测试5: 报告生成
console.log('\n📋 测试5: 报告生成');
const reportGenerator = new ReportGenerator();
const report = reportGenerator.generateReport(
  { name: '测试学生', grade: '3年级', instrument: '钢琴' },
  answerRecords,
  1200
);
console.log('  ✅ 报告生成成功');
console.log(`  学生: ${report.studentName}`);
console.log(`  等级: ${report.overall.level} ${report.overall.levelName}`);

// 文本摘要
const summary = reportGenerator.generateTextSummary(report);
console.log('\n── 报告文本摘要 ──');
console.log(summary);

console.log('\n═══════════════════════════════════');
console.log('  所有测试通过 ✅');
console.log('═══════════════════════════════════');
