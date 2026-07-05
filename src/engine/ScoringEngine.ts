import {
  Dimension, Difficulty, OverallLevel, MasteryStatus, SubTopic,
  DIMENSION_NAMES, DIMENSION_WEIGHTS, DIFFICULTY_NAMES,
  LEVEL_NAMES, ABRSM_EQUIVALENT, CCOM_EQUIVALENT,
  DIMENSION_SUBTOPICS, SUBTOPIC_NAMES,
} from '../types/enums';
import type { AnswerRecord } from '../types/question';
import type {
  DimensionDetail, OverallAssessment, AbilityProfile, WeakSubTopic,
} from '../types/assessment';

/**
 * 评分与等级判定引擎
 *
 * 职责：
 * 1. 根据答题记录计算各维度得分
 * 2. 计算加权总分并判定综合等级
 * 3. 计算置信区间
 * 4. 识别薄弱项
 * 5. 生成能力画像
 */
export class ScoringEngine {
  private dimensionWeights: Record<Dimension, number>;
  private scoreThresholds: { min: number; max: number; level: OverallLevel }[];

  constructor() {
    this.dimensionWeights = DIMENSION_WEIGHTS;
    this.scoreThresholds = [
      { min: 0, max: 25, level: OverallLevel.L1 },
      { min: 26, max: 50, level: OverallLevel.L2 },
      { min: 51, max: 75, level: OverallLevel.L3 },
      { min: 76, max: 100, level: OverallLevel.L4 },
    ];
  }

  /**
   * 计算维度得分
   */
  calculateDimensionScore(dimension: Dimension, records: AnswerRecord[]): {
    score: number;
    correctCount: number;
    totalCount: number;
    stableLevel: number;
    status: MasteryStatus;
  } {
    const dimRecords = records.filter(r => r.dimension === dimension);
    const correctCount = dimRecords.filter(r => r.correct).length;
    const totalCount = dimRecords.length;

    if (totalCount === 0) {
      return { score: 0, correctCount: 0, totalCount: 0, stableLevel: 1, status: MasteryStatus.WEAK };
    }

    const score = Math.round((correctCount / totalCount) * 100);

    // 计算稳定等级：按难度排序，找连续答对的最高难度
    const sortedRecords = [...dimRecords].sort((a, b) => b.difficulty - a.difficulty);
    let stableLevel = 1;
    for (const rec of sortedRecords) {
      if (rec.correct && rec.difficulty > stableLevel) {
        stableLevel = rec.difficulty;
      }
    }

    // 判定掌握状态
    let status: MasteryStatus;
    if (score < 40) {
      status = MasteryStatus.WEAK;
    } else if (score < 60) {
      status = MasteryStatus.NEED_IMPROVE;
    } else {
      status = MasteryStatus.MASTERED;
    }

    return { score, correctCount, totalCount, stableLevel, status };
  }

  /**
   * 计算综合评估
   */
  calculateOverall(records: AnswerRecord[]): OverallAssessment {
    // 计算加权总分
    let weightedSum = 0;
    let totalWeight = 0;
    const dimensionScores: number[] = [];

    for (const dim of Object.values(Dimension)) {
      const { score } = this.calculateDimensionScore(dim, records);
      const weight = this.dimensionWeights[dim];
      weightedSum += score * weight;
      totalWeight += weight;
      dimensionScores.push(score);
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // 判定等级
    let level = OverallLevel.L1;
    for (const threshold of this.scoreThresholds) {
      if (overallScore >= threshold.min && overallScore <= threshold.max) {
        level = threshold.level;
        break;
      }
    }

    // 计算置信区间
    const confidenceInterval = this.calculateConfidenceInterval(records);

    return {
      level,
      levelName: LEVEL_NAMES[level],
      score: overallScore,
      confidenceInterval,
      abrsmEquivalent: ABRSM_EQUIVALENT[level],
      ccomEquivalent: CCOM_EQUIVALENT[level],
    };
  }

  /**
   * 计算置信区间
   * 基于各维度得分的方差来估计
   */
  private calculateConfidenceInterval(records: AnswerRecord[]): [number, number] {
    const scores: number[] = [];
    for (const dim of Object.values(Dimension)) {
      const { score } = this.calculateDimensionScore(dim, records);
      scores.push(score);
    }

    if (scores.length === 0) return [0, 100];

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // 标准差越大，置信区间越宽
    const margin = Math.min(Math.round(stdDev * 1.5), 30);

    return [
      Math.max(0, Math.round(mean) - margin),
      Math.min(100, Math.round(mean) + margin),
    ];
  }

  /**
   * 生成各维度详情
   */
  generateDimensionDetails(records: AnswerRecord[]): DimensionDetail[] {
    const details: DimensionDetail[] = [];

    for (const dim of Object.values(Dimension)) {
      const { score, correctCount, totalCount, stableLevel, status } =
        this.calculateDimensionScore(dim, records);

      const weakSubTopics = this.identifyWeakSubTopics(dim, records);

      details.push({
        id: dim,
        name: DIMENSION_NAMES[dim],
        score,
        stableLevel,
        status,
        correctCount,
        totalCount,
        weakSubTopics,
      });
    }

    return details;
  }

  /**
   * 识别薄弱子知识点
   */
  private identifyWeakSubTopics(dimension: Dimension, records: AnswerRecord[]): WeakSubTopic[] {
    const weakSubTopics: WeakSubTopic[] = [];
    const subTopics = DIMENSION_SUBTOPICS[dimension];

    for (const st of subTopics) {
      const stRecords = records.filter(r => r.subTopic === st);
      if (stRecords.length === 0) continue;

      const correctCount = stRecords.filter(r => r.correct).length;
      const accuracy = correctCount / stRecords.length;

      if (accuracy < 0.5) {
        weakSubTopics.push({
          id: st,
          name: SUBTOPIC_NAMES[st],
          accuracy: Math.round(accuracy * 100),
          suggestion: this.getSuggestion(st, accuracy),
        });
      }
    }

    return weakSubTopics;
  }

  /**
   * 生成能力画像
   */
  generateProfile(records: AnswerRecord[]): AbilityProfile {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    const dimensionDetails = this.generateDimensionDetails(records);

    // 分析优势和薄弱维度
    for (const detail of dimensionDetails) {
      if (detail.status === MasteryStatus.MASTERED && detail.score >= 70) {
        strengths.push(this.getStrengthText(detail));
      }
      if (detail.status === MasteryStatus.WEAK) {
        weaknesses.push(this.getWeaknessText(detail));
      }
    }

    // 生成学习建议
    recommendations.push(...this.generateRecommendations(dimensionDetails, records));

    return { strengths, weaknesses, recommendations };
  }

  /**
   * 生成维度优势文字
   */
  private getStrengthText(detail: DimensionDetail): string {
    const levelName = DIFFICULTY_NAMES[detail.stableLevel as Difficulty];
    const templates: Record<Dimension, string> = {
      [Dimension.PITCH]: `${detail.name}能力强，稳定达到${levelName}水平，能准确识别音高和谱表位置`,
      [Dimension.RHYTHM]: `${detail.name}感好，稳定达到${levelName}水平，能准确辨识各种节奏型`,
      [Dimension.INTERVAL]: `${detail.name}能力强，稳定达到${levelName}水平，能准确判断音程关系`,
      [Dimension.CHORD_TONALITY]: `${detail.name}知识扎实，稳定达到${levelName}水平，对调式和和弦有较好理解`,
      [Dimension.TERMS_SYMBOLS]: `${detail.name}掌握好，稳定达到${levelName}水平，熟悉各类音乐术语`,
      [Dimension.SIGHT_READING]: `${detail.name}能力强，稳定达到${levelName}水平，识谱速度较快`,
    };
    return templates[detail.id] || `${detail.name}表现优秀`;
  }

  /**
   * 生成维度薄弱文字
   */
  private getWeaknessText(detail: DimensionDetail): string {
    const templates: Record<Dimension, string> = {
      [Dimension.PITCH]: `${detail.name}需要加强，建议多练习高/低音谱号的识谱，从中央C附近的音开始`,
      [Dimension.RHYTHM]: `${detail.name}需要加强，建议从基本音符时值和简单拍号（2/4、3/4、4/4）入手`,
      [Dimension.INTERVAL]: `${detail.name}需要加强，建议先从大小二度、大小三度的听辨开始练习`,
      [Dimension.CHORD_TONALITY]: `${detail.name}需要加强，建议先掌握C大调和a小调的基本调号和音阶结构`,
      [Dimension.TERMS_SYMBOLS]: `${detail.name}需要加强，建议从常用力度记号（p/f）和速度术语开始记忆`,
      [Dimension.SIGHT_READING]: `${detail.name}需要加强，建议从C大调简单单旋律开始练习视谱`,
    };
    return templates[detail.id] || `${detail.name}需要加强`;
  }

  /**
   * 生成学习建议
   */
  private generateRecommendations(
    dimensionDetails: DimensionDetail[],
    records: AnswerRecord[]
  ): string[] {
    const recommendations: string[] = [];
    const weakDims = dimensionDetails.filter(d => d.status === MasteryStatus.WEAK);
    const needImproveDims = dimensionDetails.filter(d => d.status === MasteryStatus.NEED_IMPROVE);

    // 根据综合等级给出对应考级建议
    const overall = this.calculateOverall(records);
    if (overall.level === OverallLevel.L1) {
      recommendations.push('建议从基础乐理知识开始系统学习，推荐使用《英皇乐理预备级》或《中央音乐学院音基初级》教材');
    } else if (overall.level === OverallLevel.L2) {
      recommendations.push('建议以英皇乐理G1-G2或央音音基初级为目标进行系统备考');
    } else if (overall.level === OverallLevel.L3) {
      recommendations.push('建议以英皇乐理G3-G4或央音音基中级为目标，重点加强薄弱环节');
    } else {
      recommendations.push('基础扎实，建议挑战英皇乐理G5或央音音基高级，可尝试英皇乐理考级报名');
    }

    // 针对薄弱维度给出具体建议
    if (weakDims.length > 0) {
      const dimNames = weakDims.map(d => d.name).join('、');
      recommendations.push(`优先加强${dimNames}方面的练习，每天安排10-15分钟专项训练`);
    }

    if (needImproveDims.length > 0) {
      const dimNames = needImproveDims.map(d => d.name).join('、');
      recommendations.push(`${dimNames}方面有提升空间，建议结合练习题巩固`);
    }

    // 听力练习建议
    const hasAudioWeakness = [...weakDims, ...needImproveDims].some(
      d => d.id === Dimension.PITCH || d.id === Dimension.INTERVAL || d.id === Dimension.RHYTHM
    );
    if (hasAudioWeakness) {
      recommendations.push('建议多进行视唱练耳训练：每天用钢琴APP模唱音阶、跟打节拍、听辨音程');
    }

    return recommendations;
  }

  /**
   * 获取子知识点改进建议
   */
  private getSuggestion(subTopic: SubTopic, accuracy: number): string {
    const suggestionMap: Partial<Record<SubTopic, string>> = {
      [SubTopic.PITCH_DIRECTION]: '多听两个音的比较，用"高/低"手势辅助判断音高方向',
      [SubTopic.NOTE_NAME_TREBLE]: '熟记高音谱号五线四间的音名（FACE + EGBDF），配合闪卡练习',
      [SubTopic.NOTE_NAME_BASS]: '熟记低音谱号五线四间的音名（ACEG + GBDFA），配合闪卡练习',
      [SubTopic.ACCIDENTALS]: '理解升降还原记号的含义，用钢琴键盘图辅助记忆半音关系',
      [SubTopic.LEDGER_LINES]: '从中央C出发逐音推算加线音，使用"高音谱号上加一线是A"等口诀',
      [SubTopic.ENHARMONIC]: '理解等音概念：同一键上不同音名（如升C=降D），用键盘图辅助',
      [SubTopic.NOTE_VALUES]: '用手打拍子感受不同音符的时值长短，画音符时值关系图',
      [SubTopic.REST_VALUES]: '休止符时值与对应音符一致，制作"音符-休止符"对照表记忆',
      [SubTopic.SIMPLE_TIME]: '多听2/4（进行曲）、3/4（圆舞曲）、4/4拍的典型音乐，感受强弱规律',
      [SubTopic.COMPOUND_TIME]: '理解6/8拍=两个大拍各含三个八分音符，用"1-2-3, 4-5-6"念拍',
      [SubTopic.DOTTED_NOTES]: '理解附点=原时值的一半，用画图法辅助计算',
      [SubTopic.TRIPLETS_DUPLETS]: '三连音=把一拍均分三份，用"苹果-苹果-苹果"念节奏',
      [SubTopic.RHYTHM_PATTERN]: '多听多模仿典型节奏型（前十六、后十六、切分等），配合节拍器练习',
      [SubTopic.INTERVAL_NUMBER]: '用"数台阶"法：从低音走到高音数几步就是几度',
      [SubTopic.INTERVAL_QUALITY]: '先记住纯音程（纯一/四/五/八度）的特征，再学大小音程',
      [SubTopic.MELODIC_INTERVAL]: '多唱旋律音程，建立"音程→歌曲开头"联想（如纯四度=《婚礼进行曲》）',
      [SubTopic.HARMONIC_INTERVAL]: '先区分协和（纯音程、大小三六度）和不协和音程的听感差异',
      [SubTopic.MAJOR_MINOR]: '大调=快乐明亮，小调=忧伤柔和，多听经典曲目对比',
      [SubTopic.KEY_SIGNATURES]: '用升降号顺序口诀记忆（升号：FCGDAEB，降号：BEADGCF）',
      [SubTopic.TRIADS]: '大三和弦=大三度+小三度（明亮），小三和弦=小三度+大三度（柔和）',
      [SubTopic.SCALE_DEGREES]: '记住音级名称：主音(I)、上主音(II)、中音(III)、下属音(IV)、属音(V)',
      [SubTopic.CADENCES]: '正格终止(V-I)听起来像"回家了"，变格终止(IV-I)像"Amen"',
      [SubTopic.DYNAMICS]: '制作力度术语卡片：pp(很弱)-p(弱)-mp(中弱)-mf(中强)-f(强)-ff(很强)',
      [SubTopic.TEMPO]: '用节拍器感受不同速度：Lento(慢)-Andante(行)-Allegro(快)-Presto(急)',
      [SubTopic.ARTICULATION]: '理解staccato(跳音)、legato(连音)、accent(重音)的演奏效果差异',
      [SubTopic.ORNAMENTS]: '用音频对比听颤音、波音、回音、倚音的实际演奏效果',
      [SubTopic.REPEAT_SIGNS]: '理解D.C.(从头反复)、D.S.(从记号反复)、Fine(结束)、Coda(尾声)',
      [SubTopic.SIMPLE_SIGHT]: '从C大调单旋律开始，先认节奏再认音高，每天坚持视唱新谱',
      [SubTopic.MODULATION_SIGHT]: '视谱前先看调号，确定do的位置再开始',
      [SubTopic.TRANSPOSITION]: '理解移调=整体移动音高，用音程度数法或调号法',
      [SubTopic.SEQUENCE]: '模进=同样的旋律模式在不同音高上重复，注意识别模式',
    };

    return suggestionMap[subTopic] || '建议针对此知识点进行专项练习';
  }
}
