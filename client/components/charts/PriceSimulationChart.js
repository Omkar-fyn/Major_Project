'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { assetAPI } from '@/lib/api';
import styles from './Charts.module.css';

export default function PriceSimulationChart({ assetId, basePrice }) {
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  
  const [priceChange, setPriceChange] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const intervalRef = useRef(null);

  const fetchChartData = useCallback(async () => {
    try {
      const data = await assetAPI.getChartData(assetId);
      if (data.priceHistory && data.timestamps) {
        const formatted = data.priceHistory.map((price, i) => {
          // lightweight-charts requires time in seconds timestamp for daily/intraday or string yyyy-mm-dd
          const time = Math.floor(new Date(data.timestamps[i]).getTime() / 1000);
          return { time, value: price };
        });
        
        // Remove duplicates if any
        const uniqueFormatted = formatted.filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);
        // Sort by time
        uniqueFormatted.sort((a, b) => a.time - b.time);

        if (seriesRef.current && uniqueFormatted.length > 0) {
          seriesRef.current.setData(uniqueFormatted);
        }

        // Calculate price change from first to last
        if (uniqueFormatted.length > 0) {
          const first = uniqueFormatted[0].value;
          const last = uniqueFormatted[uniqueFormatted.length - 1].value;
          const change = ((last - first) / first * 100).toFixed(2);
          setPriceChange(parseFloat(change));
          setCurrentPrice(last);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  }, [assetId]);

  useEffect(() => {
    // Initialize Chart
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: 0, // Normal mode
        vertLine: {
          width: 1,
          color: '#758696',
          style: 3,
          labelBackgroundColor: '#2b2b43',
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: 3,
          labelBackgroundColor: '#2b2b43',
        },
      }
    });

    chartInstanceRef.current = chart;

    const areaSeries = chart.addAreaSeries({
      lineColor: '#0ab39c',
      topColor: 'rgba(10, 179, 156, 0.5)',
      bottomColor: 'rgba(10, 179, 156, 0.05)',
      lineWidth: 2,
    });
    seriesRef.current = areaSeries;

    window.addEventListener('resize', handleResize);
    fetchChartData();
    intervalRef.current = setInterval(fetchChartData, 3000);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [fetchChartData]);

  useEffect(() => {
    // Dynamically change color based on price change
    if (seriesRef.current) {
      const isUp = priceChange >= 0;
      seriesRef.current.applyOptions({
        lineColor: isUp ? '#0ab39c' : '#f06548',
        topColor: isUp ? 'rgba(10, 179, 156, 0.4)' : 'rgba(240, 101, 72, 0.4)',
        bottomColor: isUp ? 'rgba(10, 179, 156, 0.05)' : 'rgba(240, 101, 72, 0.05)',
      });
    }
  }, [priceChange]);

  const isUp = priceChange >= 0;

  return (
    <div className={`${styles.chartCard} ${styles.brokerCard}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 className={styles.chartTitle} style={{ color: '#d1d4dc' }}>
            <span className={styles.chartTitleIcon}>📈</span>
            Market Price
          </h3>
          <p className={styles.chartSubtitle} style={{ color: '#787b86' }}>Live Order Book Simulation</p>
        </div>
        <div className={styles.timeframes}>
          <button className={styles.timeframeActive}>1H</button>
          <button className={styles.timeframeBtn}>1D</button>
          <button className={styles.timeframeBtn}>1W</button>
          <button className={styles.timeframeBtn}>1M</button>
        </div>
      </div>

      <div className={styles.priceChange}>
        <span className={`${styles.priceChangeValue} ${isUp ? styles.priceUp : styles.priceDown}`}>
          ₹{currentPrice.toLocaleString('en-IN')}
        </span>
        <span className={`${styles.priceChangeValue} ${isUp ? styles.priceUp : styles.priceDown}`} style={{ fontSize: '0.85rem' }}>
          {isUp ? '▲' : '▼'} {Math.abs(priceChange)}%
        </span>
        <div className={styles.liveIndicator} style={{ marginLeft: '12px' }}>
          <span className={styles.liveDot}></span>
          Live
        </div>
      </div>

      <div 
        ref={chartContainerRef} 
        className={styles.chartWrapperTall} 
        style={{ marginTop: '20px', height: '350px' }} 
      />
    </div>
  );
}
