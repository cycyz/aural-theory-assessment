/**
 * 评估维度枚举
 * 参考英皇乐理（ABRSM G1-G5）与中央音乐学院音基（初级-高级）考试大纲
 */
export enum Dimension {
  /** D1 - 音高辨识：识别单音音高、音名、谱表位置 */
  PITCH = 'D1',
  /** D2 - 节奏感知：音符时值、节拍辨识、节奏型识别 */
  RHYTHM = 'D2',
  /** D3 - 音程听辨：旋律音程与和声音程的度数/性质判断 */
  INTERVAL = 'D3',
  /** D4 - 和弦与调式：三和弦构成、大小调辨识、调号 */
  CHORD_TONALITY = 'D4',
  /** D5 - 音乐术语与符号：速度/力度/表情术语、常用符号 */
  TERMS_SYMBOLS = 'D5',
  /** D6 - 视谱能力：五线谱识谱速度、模进、旋律理解 */
  SIGHT_READING = 'D6',
}

/** 维度名称映射 */
export const DIMENSION_NAMES: Record<Dimension, string> = {
  [Dimension.PITCH]: '音高辨识',
  [Dimension.RHYTHM]: '节奏感知',
  [Dimension.INTERVAL]: '音程听辨',
  [Dimension.CHORD_TONALITY]: '和弦与调式',
  [Dimension.TERMS_SYMBOLS]: '音乐术语与符号',
  [Dimension.SIGHT_READING]: '视谱能力',
};

/** 维度权重（用于加权评分） */
export const DIMENSION_WEIGHTS: Record<Dimension, number> = {
  [Dimension.PITCH]: 1.5,
  [Dimension.RHYTHM]: 1.5,
  [Dimension.INTERVAL]: 1.0,
  [Dimension.CHORD_TONALITY]: 1.0,
  [Dimension.TERMS_SYMBOLS]: 0.8,
  [Dimension.SIGHT_READING]: 1.2,
};

/**
 * 难度等级枚举
 */
export enum Difficulty {
  /** L1 启蒙级 */
  BEGINNER = 1,
  /** L2 初级 */
  ELEMENTARY = 2,
  /** L3 中级 */
  INTERMEDIATE = 3,
  /** L4 高级 */
  ADVANCED = 4,
}

/** 难度等级名称 */
export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  [Difficulty.BEGINNER]: '启蒙级',
  [Difficulty.ELEMENTARY]: '初级',
  [Difficulty.INTERMEDIATE]: '中级',
  [Difficulty.ADVANCED]: '高级',
};

/**
 * 题目类型枚举
 */
export enum QuestionType {
  /** 纯文字选项 */
  SINGLE_CHOICE_TEXT = 'single_choice_text',
  /** 图片选项 */
  SINGLE_CHOICE_IMAGE = 'single_choice_image',
  /** 乐谱选项（五线谱） */
  SINGLE_CHOICE_NOTATION = 'single_choice_notation',
  /** 音频选项 */
  SINGLE_CHOICE_AUDIO = 'single_choice_audio',
}

/**
 * 子知识点枚举（用于薄弱项精确定位）
 */
export enum SubTopic {
  // D1 音高辨识 子知识点
  PITCH_DIRECTION = 'pitch_direction',
  NOTE_NAME_TREBLE = 'note_name_treble',
  NOTE_NAME_BASS = 'note_name_bass',
  ACCIDENTALS = 'accidentals',
  LEDGER_LINES = 'ledger_lines',
  ENHARMONIC = 'enharmonic',

  // D2 节奏感知 子知识点
  NOTE_VALUES = 'note_values',
  REST_VALUES = 'rest_values',
  SIMPLE_TIME = 'simple_time',
  COMPOUND_TIME = 'compound_time',
  DOTTED_NOTES = 'dotted_notes',
  TRIPLETS_DUPLETS = 'triplets_duplets',
  RHYTHM_PATTERN = 'rhythm_pattern',

  // D3 音程听辨 子知识点
  INTERVAL_NUMBER = 'interval_number',
  INTERVAL_QUALITY = 'interval_quality',
  MELODIC_INTERVAL = 'melodic_interval',
  HARMONIC_INTERVAL = 'harmonic_interval',

  // D4 和弦与调式 子知识点
  MAJOR_MINOR = 'major_minor',
  KEY_SIGNATURES = 'key_signatures',
  TRIADS = 'triads',
  SCALE_DEGREES = 'scale_degrees',
  CADENCES = 'cadences',

  // D5 音乐术语与符号 子知识点
  DYNAMICS = 'dynamics',
  TEMPO = 'tempo',
  ARTICULATION = 'articulation',
  ORNAMENTS = 'ornaments',
  REPEAT_SIGNS = 'repeat_signs',

  // D6 视谱能力 子知识点
  SIMPLE_SIGHT = 'simple_sight',
  MODULATION_SIGHT = 'modulation_sight',
  TRANSPOSITION = 'transposition',
  SEQUENCE = 'sequence',
}

/** 子知识点名称映射 */
export const SUBTOPIC_NAMES: Record<SubTopic, string> = {
  [SubTopic.PITCH_DIRECTION]: '音高方向判断',
  [SubTopic.NOTE_NAME_TREBLE]: '高音谱号音名',
  [SubTopic.NOTE_NAME_BASS]: '低音谱号音名',
  [SubTopic.ACCIDENTALS]: '升降还原记号',
  [SubTopic.LEDGER_LINES]: '加线识谱',
  [SubTopic.ENHARMONIC]: '等音转换',
  [SubTopic.NOTE_VALUES]: '音符时值',
  [SubTopic.REST_VALUES]: '休止符',
  [SubTopic.SIMPLE_TIME]: '简单拍号',
  [SubTopic.COMPOUND_TIME]: '复合拍号',
  [SubTopic.DOTTED_NOTES]: '附点音符',
  [SubTopic.TRIPLETS_DUPLETS]: '三连音/二连音',
  [SubTopic.RHYTHM_PATTERN]: '节奏型听辨',
  [SubTopic.INTERVAL_NUMBER]: '音程度数',
  [SubTopic.INTERVAL_QUALITY]: '音程性质',
  [SubTopic.MELODIC_INTERVAL]: '旋律音程',
  [SubTopic.HARMONIC_INTERVAL]: '和声音程',
  [SubTopic.MAJOR_MINOR]: '大小调辨识',
  [SubTopic.KEY_SIGNATURES]: '调号',
  [SubTopic.TRIADS]: '三和弦',
  [SubTopic.SCALE_DEGREES]: '音级',
  [SubTopic.CADENCES]: '终止式',
  [SubTopic.DYNAMICS]: '力度记号',
  [SubTopic.TEMPO]: '速度术语',
  [SubTopic.ARTICULATION]: '演奏法记号',
  [SubTopic.ORNAMENTS]: '装饰音',
  [SubTopic.REPEAT_SIGNS]: '反复记号',
  [SubTopic.SIMPLE_SIGHT]: '简单视谱',
  [SubTopic.MODULATION_SIGHT]: '含调号视谱',
  [SubTopic.TRANSPOSITION]: '移调',
  [SubTopic.SEQUENCE]: '模进',
};

/** 维度包含的子知识点 */
export const DIMENSION_SUBTOPICS: Record<Dimension, SubTopic[]> = {
  [Dimension.PITCH]: [
    SubTopic.PITCH_DIRECTION, SubTopic.NOTE_NAME_TREBLE,
    SubTopic.NOTE_NAME_BASS, SubTopic.ACCIDENTALS,
    SubTopic.LEDGER_LINES, SubTopic.ENHARMONIC,
  ],
  [Dimension.RHYTHM]: [
    SubTopic.NOTE_VALUES, SubTopic.REST_VALUES,
    SubTopic.SIMPLE_TIME, SubTopic.COMPOUND_TIME,
    SubTopic.DOTTED_NOTES, SubTopic.TRIPLETS_DUPLETS,
    SubTopic.RHYTHM_PATTERN,
  ],
  [Dimension.INTERVAL]: [
    SubTopic.INTERVAL_NUMBER, SubTopic.INTERVAL_QUALITY,
    SubTopic.MELODIC_INTERVAL, SubTopic.HARMONIC_INTERVAL,
  ],
  [Dimension.CHORD_TONALITY]: [
    SubTopic.MAJOR_MINOR, SubTopic.KEY_SIGNATURES,
    SubTopic.TRIADS, SubTopic.SCALE_DEGREES, SubTopic.CADENCES,
  ],
  [Dimension.TERMS_SYMBOLS]: [
    SubTopic.DYNAMICS, SubTopic.TEMPO, SubTopic.ARTICULATION,
    SubTopic.ORNAMENTS, SubTopic.REPEAT_SIGNS,
  ],
  [Dimension.SIGHT_READING]: [
    SubTopic.SIMPLE_SIGHT, SubTopic.MODULATION_SIGHT,
    SubTopic.TRANSPOSITION, SubTopic.SEQUENCE,
  ],
};

/**
 * 综合评估等级
 */
export enum OverallLevel {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  L4 = 'L4',
}

/** 评估等级名称 */
export const LEVEL_NAMES: Record<OverallLevel, string> = {
  [OverallLevel.L1]: '启蒙级',
  [OverallLevel.L2]: '初级',
  [OverallLevel.L3]: '中级',
  [OverallLevel.L4]: '高级',
};

/** 英皇乐理等级对应 */
export const ABRSM_EQUIVALENT: Record<OverallLevel, string> = {
  [OverallLevel.L1]: '预备级及以下',
  [OverallLevel.L2]: 'G1-G2',
  [OverallLevel.L3]: 'G3-G4',
  [OverallLevel.L4]: 'G5及以上',
};

/** 央音音基等级对应 */
export const CCOM_EQUIVALENT: Record<OverallLevel, string> = {
  [OverallLevel.L1]: '未达初级',
  [OverallLevel.L2]: '初级水平',
  [OverallLevel.L3]: '中级水平',
  [OverallLevel.L4]: '高级水平',
};

/**
 * 维度掌握状态
 */
export enum MasteryStatus {
  /** 薄弱（得分 < 40%） */
  WEAK = 'weak',
  /** 需要加强（得分 40%-60%） */
  NEED_IMPROVE = 'need_improve',
  /** 已掌握（得分 > 60%） */
  MASTERED = 'mastered',
}

/** 评估流程阶段 */
export enum AssessmentPhase {
  /** 引导页 */
  WELCOME = 'welcome',
  /** 摸底轮 */
  BASELINE = 'baseline',
  /** 自适应轮 */
  ADAPTIVE = 'adaptive',
  /** 评估报告 */
  REPORT = 'report',
}
