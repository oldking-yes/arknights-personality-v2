import {
  RadarChart as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DIM_LABELS } from '../data/types';

interface RadarChartProps {
  user: number[];
  operator: number[];
  color: string;
  opName: string;
}

export default function RadarChart({ user, operator, color, opName }: RadarChartProps) {
  const data = DIM_LABELS.map((label, i) => ({
    dimension: label,
    [opName]: operator[i],
    你: user[i],
  }));

  return (
    <div className="bg-slate-800/60 border border-slate-700/30 p-3 sm:p-4">
      <p className="font-mono text-[0.6rem] tracking-[0.2em] text-slate-500 text-center mb-1 uppercase">
        人格图谱 · Personality Matrix
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <ReRadar data={data} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid stroke="#1e2d40" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#607080', fontSize: 11, fontFamily: 'Noto Sans SC, sans-serif' }} />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar name={opName} dataKey={opName} stroke={color} fill={color} fillOpacity={0.08} strokeWidth={1.5} />
          <Radar name="你" dataKey="你" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2.5} />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'Share Tech Mono, monospace', color: '#607080' }}
            iconType="rect"
          />
        </ReRadar>
      </ResponsiveContainer>
    </div>
  );
}
