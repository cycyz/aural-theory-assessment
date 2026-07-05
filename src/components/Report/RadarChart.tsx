import React from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DimensionDetail } from '../../types/assessment';

interface RadarChartProps {
  dimensions: DimensionDetail[];
}

/**
 * 六维能力雷达图
 * 使用 Recharts 渲染真实的雷达图
 */
export const RadarChart: React.FC<RadarChartProps> = ({ dimensions }) => {
  // 转换为 Recharts 需要的格式
  const data = dimensions.map(dim => ({
    dimension: dim.name,
    score: dim.score,
    fullMark: 100,
  }));

  // 计算平均分用于参考线
  const avgScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      boxShadow: 'var(--shadow-md)',
      marginBottom: 'var(--space-lg)',
    }}>
      <h4 style={{
        fontSize: 'var(--font-md)',
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: 'var(--space-sm)',
        textAlign: 'center',
      }}>
        📊 六维能力图
      </h4>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <RechartsRadar
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%"
          >
            <PolarGrid stroke="#e0d8cf" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fontSize: 13,
                fill: '#666',
                fontWeight: 500,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#999' }}
              tickCount={6}
              stroke="#e0d8cf"
            />
            <Tooltip
              formatter={(value: unknown) => [`${value} 分`, '得分']}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e0d8cf',
                fontSize: 13,
              }}
            />
            <Radar
              name="能力得分"
              dataKey="score"
              stroke="#4D96FF"
              fill="#4D96FF"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      {/* 图例说明 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        marginTop: 'var(--space-sm)',
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)',
      }}>
        <span>🟦 蓝色区域 = 你的能力范围</span>
        <span>平均分：{avgScore}/100</span>
      </div>
    </div>
  );
};
