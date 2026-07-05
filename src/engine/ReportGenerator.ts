import type { AnswerRecord } from '../types/question';
import type { AssessmentReport, StudentInfo } from '../types/assessment';
import { ScoringEngine } from './ScoringEngine';

/**
 * 评估报告生成器
 *
 * 职责：
 * 1. 整合答题记录和学生信息，生成完整评估报告
 * 2. 格式化报告数据
 */
export class ReportGenerator {
  private scoringEngine: ScoringEngine;

  constructor() {
    this.scoringEngine = new ScoringEngine();
  }

  /**
   * 生成完整评估报告
   */
  generateReport(
    studentInfo: StudentInfo,
    answerRecords: AnswerRecord[],
    totalTimeSeconds: number
  ): AssessmentReport {
    const overall = this.scoringEngine.calculateOverall(answerRecords);
    const dimensions = this.scoringEngine.generateDimensionDetails(answerRecords);
    const profile = this.scoringEngine.generateProfile(answerRecords);

    return {
      studentName: studentInfo.name,
      assessmentDate: new Date().toISOString(),
      totalTimeSeconds,
      totalQuestions: answerRecords.length,
      overall,
      dimensions,
      profile,
      answerDetails: answerRecords,
    };
  }

  /**
   * 生成纯文本摘要（用于分享/打印）
   */
  generateTextSummary(report: AssessmentReport): string {
    const lines: string[] = [
      '═══════════════════════════════',
      '  视唱练耳与乐理水平评估报告',
      '═══════════════════════════════',
      '',
      `学生：${report.studentName}`,
      `日期：${new Date(report.assessmentDate).toLocaleDateString('zh-CN')}`,
      `用时：${Math.floor(report.totalTimeSeconds / 60)}分${report.totalTimeSeconds % 60}秒`,
      `题数：${report.totalQuestions}题`,
      '',
      '── 综合评估 ──',
      `等级：${report.overall.levelName}（${report.overall.level}）`,
      `得分：${report.overall.score}/100`,
      `英皇对应：${report.overall.abrsmEquivalent}`,
      `央音对应：${report.overall.ccomEquivalent}`,
      `置信区间：${report.overall.confidenceInterval[0]}-${report.overall.confidenceInterval[1]}`,
      '',
      '── 各维度得分 ──',
    ];

    for (const dim of report.dimensions) {
      const statusIcon = dim.status === 'mastered' ? '✅' : dim.status === 'weak' ? '⚠️' : '📝';
      lines.push(
        `${statusIcon} ${dim.name}：${dim.score}分 (${dim.correctCount}/${dim.totalCount})`
      );
      if (dim.weakSubTopics.length > 0) {
        for (const wst of dim.weakSubTopics) {
          lines.push(`   ↳ ${wst.name}需要加强（正确率${wst.accuracy}%）`);
        }
      }
    }

    lines.push('');
    lines.push('── 能力画像 ──');

    if (report.profile.strengths.length > 0) {
      lines.push('优势：');
      for (const s of report.profile.strengths) {
        lines.push(`  • ${s}`);
      }
    }

    if (report.profile.weaknesses.length > 0) {
      lines.push('薄弱：');
      for (const w of report.profile.weaknesses) {
        lines.push(`  • ${w}`);
      }
    }

    lines.push('');
    lines.push('── 学习建议 ──');
    for (const r of report.profile.recommendations) {
      lines.push(`  ${r}`);
    }

    lines.push('');
    lines.push('═══════════════════════════════');

    return lines.join('\n');
  }

  /**
   * 获取评分引擎（用于外部访问）
   */
  getScoringEngine(): ScoringEngine {
    return this.scoringEngine;
  }
}
