import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
          style={{ background: '#0D0F11', color: '#E8E3D8' }}>
          <div className="font-serif-en text-sm tracking-[0.4em] text-warm-dim mb-4">R.I.</div>
          <p className="font-serif-cn text-sm text-warm-muted mb-8 leading-relaxed max-w-xs">
            数据流紊乱，终端暂不可用。<br />
            <span className="text-warm-dim text-xs">
              {this.state.error?.message.slice(0, 100)}
            </span>
          </p>
          <button onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white/5 border border-warm-dim/20 text-warm-muted text-xs tracking-[0.2em] hover:bg-white/10 transition-colors">
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
