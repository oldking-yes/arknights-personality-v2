import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { DIM_LABELS } from '../data/types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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
            borderColor: color,
            backgroundColor: color + '33',
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: color,
            pointBorderColor: '#07090e',
            pointBorderWidth: 1.5,
          },
          {
            label: opName,
            data: operator,
            borderColor: color,
            backgroundColor: color + '14',
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#607080',
              font: { family: "'Share Tech Mono', monospace", size: 11 },
              boxWidth: 12,
              boxHeight: 4,
              padding: 12,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15,21,32,0.9)',
            titleColor: '#c8d0dc',
            bodyColor: '#8a9bb5',
            borderColor: 'rgba(30,45,64,0.5)',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 0,
            titleFont: { family: "'Space Grotesk', sans-serif", size: 12 },
            bodyFont: { family: "'Space Grotesk', sans-serif", size: 11 },
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
              color: 'rgba(30,45,64,0.6)',
              lineWidth: 1,
            },
            angleLines: {
              color: 'rgba(30,45,64,0.4)',
              lineWidth: 1,
            },
            pointLabels: {
              color: '#607080',
              font: { family: "'Noto Sans SC', sans-serif", size: 11 },
              padding: 16,
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
    <div className="bg-slate-800/60 border border-slate-700/30 p-3 sm:p-4">
      <p className="font-mono text-[0.6rem] tracking-[0.2em] text-slate-500 text-center mb-1 uppercase">
        人格图谱 · Personality Matrix
      </p>
      <div className="w-full" style={{ height: 280 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
