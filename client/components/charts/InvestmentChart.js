'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import styles from './Charts.module.css';

// Gradient bar colors for each asset
const BAR_COLORS = [
  '#387ed1', '#0ab39c', '#6559cc',
  '#f7b84b', '#f06548', '#299cdb',
  '#3577f1', '#0ab39c', '#6559cc'
];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{payload[0].payload.name}</p>
        <p className={styles.tooltipValue}>
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
}

export default function InvestmentChart({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>
          <span className={styles.chartTitleIcon}>📊</span>
          Investment Distribution
        </h3>
        <p className={styles.chartSubtitle}>Your investment across different assets</p>
        <div className={styles.chartEmpty}>
          <span className={styles.chartEmptyIcon}>📭</span>
          <p>No investments yet. Start investing to see your portfolio distribution.</p>
        </div>
      </div>
    );
  }

  // Prepare data: truncate long asset names for axis labels
  const data = holdings.map((h) => ({
    name: h.asset?.name?.length > 18
      ? h.asset.name.substring(0, 18) + '…'
      : h.asset?.name || 'Unknown',
    fullName: h.asset?.name || 'Unknown',
    invested: h.totalInvested,
    tokens: h.tokensOwned,
    category: h.asset?.category
  }));

  const totalInvested = data.reduce((sum, d) => sum + d.invested, 0);

  return (
    <div className={styles.chartCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 className={styles.chartTitle}>
            <span className={styles.chartTitleIcon}>📊</span>
            Investment Distribution
          </h3>
          <p className={styles.chartSubtitle}>
            Total: ₹{totalInvested.toLocaleString('en-IN')} across {data.length} asset{data.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className={styles.chartWrapperTall}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
            barCategoryGap="20%"
          >
            <defs>
              {data.map((_, i) => (
                <linearGradient
                  key={`barGrad-${i}`}
                  id={`barGrad-${i}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="0%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={1} />
                  <stop offset="100%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e9ecef"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6c757d' }}
              tickLine={false}
              axisLine={{ stroke: '#e9ecef' }}
              angle={-20}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#adb5bd' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 126, 209, 0.04)' }} />
            <Bar
              dataKey="invested"
              radius={[6, 6, 0, 0]}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={`url(#barGrad-${i})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
