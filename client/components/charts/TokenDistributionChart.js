'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './Charts.module.css';

const COLORS = {
  sold: '#387ed1',
  available: '#e9ecef'
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{payload[0].name}</p>
        <p className={styles.tooltipValue}>
          {payload[0].value.toLocaleString('en-IN')} tokens
        </p>
      </div>
    );
  }
  return null;
}

export default function TokenDistributionChart({ totalTokens, availableTokens }) {
  const soldTokens = totalTokens - availableTokens;
  const soldPercent = ((soldTokens / totalTokens) * 100).toFixed(1);

  const data = [
    { name: 'Sold Tokens', value: soldTokens },
    { name: 'Available Tokens', value: availableTokens }
  ];

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>
        <span className={styles.chartTitleIcon}>🔵</span>
        Token Distribution
      </h3>
      <p className={styles.chartSubtitle}>
        {soldPercent}% of total supply sold
      </p>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              strokeWidth={0}
            >
              <Cell fill={COLORS.sold} />
              <Cell fill={COLORS.available} />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#212529"
              fontSize="1.6rem"
              fontWeight="800"
              fontFamily="'JetBrains Mono', monospace"
            >
              {soldPercent}%
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#6c757d"
              fontSize="0.7rem"
              fontWeight="500"
            >
              SOLD
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.pieLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.sold }}></span>
          Sold
          <span className={styles.legendValue}>{soldTokens.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.available }}></span>
          Available
          <span className={styles.legendValue}>{availableTokens.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
