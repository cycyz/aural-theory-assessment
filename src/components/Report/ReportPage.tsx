import React, { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import type { AssessmentReport as ReportData } from '../../types/assessment';
import { formatDate, formatTime } from '../../utils/format';
import { OverallScore } from './OverallScore';
import { RadarChart } from './RadarChart';
import { DimensionDetailCard } from './DimensionDetail';
import { ProfileCard } from './ProfileCard';
import { Button } from '../common/Button';

interface ReportPageProps {
  report: ReportData;
  onRestart: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ report, onRestart }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  /** 导出为图片 */
  const handleExportImage = useCallback(async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#f5f0eb',
        scale: 2, // 2x 高清
        useCORS: true,
        logging: false,
      });

      // 触发下载
      const link = document.createElement('a');
      link.download = `乐理评估报告_${report.studentName}_${new Date().toLocaleDateString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('导出失败:', e);
      alert('导出图片失败，请尝试截图或打印。');
    }

    setIsExporting(false);
  }, [report.studentName]);

  return (
    <div style={{
      maxWidth: 560,
      margin: '0 auto',
      padding: 'var(--space-md)',
    }}>
      {/* 可导出区域 */}
      <div ref={reportRef}>
        {/* 标题 */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-lg)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-xl)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-xs)',
          }}>
            📋 评估报告
          </h2>
          <p style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}>
            {report.studentName} · {formatDate(report.assessmentDate)} · 用时 {formatTime(report.totalTimeSeconds)}
          </p>
        </div>

        {/* 综合评分 */}
        <OverallScore overall={report.overall} />

        {/* 六维能力图 */}
        <RadarChart dimensions={report.dimensions} />

        {/* 各维度详情 */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{
            fontSize: 'var(--font-md)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-md)',
          }}>
            📝 各维度详细分析
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            {report.dimensions.map(dim => (
              <DimensionDetailCard key={dim.id} dimension={dim} />
            ))}
          </div>
        </div>

        {/* 能力画像 */}
        <ProfileCard profile={report.profile} />
      </div>

      {/* 操作按钮（不导出） */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        paddingBottom: 'var(--space-xl)',
        paddingTop: 'var(--space-lg)',
        flexWrap: 'wrap',
      }}>
        <Button variant="secondary" onClick={onRestart}>
          重新评估 🔄
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          打印报告 🖨️
        </Button>
        <Button
          variant="success"
          onClick={handleExportImage}
          disabled={isExporting}
        >
          {isExporting ? '导出中...' : '保存图片 💾'}
        </Button>
      </div>
    </div>
  );
};
