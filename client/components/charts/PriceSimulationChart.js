'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { assetAPI } from '@/lib/api';
import styles from './Charts.module.css';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
}

export default function PriceSimulationChart({ assetId, basePrice }) {
  const [chartData, setChartData] = useState([]);
  const [priceChange, setPriceChange] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const intervalRef = useRef(null);

  const fetchChartData = useCallback(async () => {
    try {
      const data = await assetAPI.getChartData(assetId);
      if (data.priceHistory && data.timestamps) {
        const formatted = data.priceHistory.map((price, i) => {
          const time = new Date(data.timestamps[i]);
          return {
            time: time.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }),
            price: price
          };
        });
        setChartData(formatted);

        // Calculate price change from first to last
        const first = data.priceHistory[0];
        const last = data.priceHistory[data.priceHistory.length - 1];
        const change = ((last - first) / first * 100).toFixed(2);
        setPriceChange(parseFloat(change));
        setCurrentPrice(last);
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  }, [assetId]);

  useEffect(() => {
    // Initial fetch
    fetchChartData();

    // Poll every 3 seconds for live updates
    intervalRef.current = setInterval(fetchChartData, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchChartData]);

  const isUp = priceChange >= 0;
  const gradientId = `priceGradient-${assetId}`;

  return (
    <div className={styles.chartCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 className={styles.chartTitle}>
            <span className={styles.chartTitleIcon}>📈</span>
            Price Simulation
          </h3>
          <p className={styles.chartSubtitle}>Live simulated market price</p>
        </div>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span>
          Live
        </div>
      </div>

      <div className={styles.priceChange}>
        <span className={`${styles.priceChangeValue} ${isUp ? styles.priceUp : styles.priceDown}`}>
          ₹{currentPrice.toLocaleString('en-IN')}
        </span>
        <span className={`${styles.priceChangeValue} ${isUp ? styles.priceUp : styles.priceDown}`} style={{ fontSize: '0.78rem' }}>
          {isUp ? '▲' : '▼'} {Math.abs(priceChange)}%
        </span>
      </div>

      <div className={styles.chartWrapperTall} style={{ marginTop: '12px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isUp ? '#0ab39c' : '#f06548'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isUp ? '#0ab39c' : '#f06548'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e9ecef"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#adb5bd' }}
              tickLine={false}
              axisLine={{ stroke: '#e9ecef' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#adb5bd' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
              domain={['auto', 'auto']}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isUp ? '#0ab39c' : '#f06548'}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              animationDuration={500}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
