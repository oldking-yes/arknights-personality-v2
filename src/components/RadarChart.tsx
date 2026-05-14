import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController,
} from 'chart.js';
import { DIM_LABELS } from '../data/types';

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  user: number[];
  operator: number[];
  color: string;
  opName: string;
}

export default function RadarChart({ user, operator, color, opName }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<'radar'> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels: DIM_LABELS,
        datasets: [
          {
            label: '你',
            data: user,
            borderColor: '#E8E3D8',
            backgroundColor: 'rgba(232,227,216,0.06)',
            borderWidth: 1.5,
            pointRadius: 2.5,
            pointBackgroundColor: '#E8E3D8',
            pointBorderColor: '#0D0F11',
            pointBorderWidth: 1,
          },
          {
            label: opName,
            data: operator,
            borderColor: color,
            backgroundColor: color + '14',
            borderWidth: 1,
            borderDash: [3, 3],
            pointRadius: 2,
            pointBackgroundColor: color,
            pointBorderColor: '#0D0F11',
            pointBorderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#8A8270',
              font: { family: "'Cormorant Garamond', serif", size: 12 },
              boxWidth: 12,
              boxHeight: 4,
              padding: 16,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(13,15,17,0.95)',
            titleColor: '#E8E3D8',
            bodyColor: '#B8B0A0',
            borderColor: 'rgba(232,227,216,0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 0,
            titleFont: { family: "'Cormorant Garamond', serif", size: 12 },
            bodyFont: { family: "'Noto Sans SC', sans-serif", size: 11 },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              display: false,
            },
            grid: {
              color: 'rgba(232,227,216,0.08)',
              lineWidth: 1,
            },
            angleLines: {
              color: 'rgba(232,227,216,0.06)',
              lineWidth: 1,
            },
            pointLabels: {
              color: '#8A8270',
              font: { family: "'Noto Sans SC', sans-serif", size: 11 },
              padding: 20,
            },
          },
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart',
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [user, operator, color, opName]);

  return (
    <div className="border border-white/5">
      <div className="section-label mb-3 px-4 pt-4">人格图谱</div>
      <div className="w-full aspect-square" style={{ maxHeight: 360 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
