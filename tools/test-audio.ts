/**
 * 音频合成测试脚本
 * 验证所有 11 个题库音频路径都有对应的合成指令
 */
import { hasSynthesis } from '../src/audio/AudioPlayer.ts';
import { NoteSynthesizer, getSynthesizer } from '../src/audio/NoteSynthesizer.ts';

// 题库中所有引用的音频路径
const AUDIO_PATHS_IN_QUESTIONS = [
  // D1 音高辨识
  '/audio/notes/pitch_up.ogg',

  // D2 节奏感知
  '/audio/rhythms/rhythm_simple_01.ogg',

  // D3 音程听辨
  '/audio/intervals/melodic_C4_C4.ogg',
  '/audio/intervals/melodic_C4_C5.ogg',
  '/audio/intervals/melodic_C4_D4.ogg',
  '/audio/intervals/melodic_C4_E4.ogg',
  '/audio/intervals/melodic_C4_G4.ogg',
  '/audio/intervals/harmonic_C4_G4.ogg',
  '/audio/melodies/interval_test_01.ogg',

  // D4 和弦与调式
  '/audio/melodies/major_happy.ogg',
  '/audio/melodies/minor_sad.ogg',
];

console.log('═══════════════════════════════════');
console.log('  音频合成映射完整性测试');
console.log('═══════════════════════════════════\n');

let allCovered = true;
let coveredCount = 0;

for (const path of AUDIO_PATHS_IN_QUESTIONS) {
  const covered = hasSynthesis(path);
  console.log(`  ${covered ? '✅' : '❌'} ${path}`);
  if (covered) coveredCount++;
  else allCovered = false;
}

console.log(`\n  覆盖率: ${coveredCount}/${AUDIO_PATHS_IN_QUESTIONS.length}`);

// 测试 NoteSynthesizer 频率计算
console.log('\n📋 频率计算测试:');
const synth = getSynthesizer();

const testNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const expectedFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

for (let i = 0; i < testNotes.length; i++) {
  const freq = synth.getFrequency(testNotes[i]);
  const expected = expectedFreqs[i];
  const diff = Math.abs(freq - expected);
  const ok = diff < 0.1;
  console.log(`  ${ok ? '✅' : '❌'} ${testNotes[i]}: ${freq.toFixed(2)} Hz (期望 ${expected})`);
  if (!ok) allCovered = false;
}

// 测试动态频率计算（不在预设表中的音）
console.log('\n📋 动态频率计算测试:');
const dynamicTests = [
  { note: 'Eb4', expected: 311.13 },
  { note: 'F#4', expected: 369.99 },
  { note: 'Ab4', expected: 415.30 },
  { note: 'Bb4', expected: 466.16 },
];

for (const { note, expected } of dynamicTests) {
  const freq = synth.getFrequency(note);
  const diff = Math.abs(freq - expected);
  const ok = diff < 0.2;
  console.log(`  ${ok ? '✅' : '❌'} ${note}: ${freq.toFixed(2)} Hz (期望 ${expected})`);
  if (!ok) allCovered = false;
}

console.log('\n═══════════════════════════════════');
console.log(allCovered ? '  所有测试通过 ✅' : '  部分测试失败 ❌');
console.log('═══════════════════════════════════');
