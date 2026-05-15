import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RadarChart from './RadarChart';
import { DIM_LABELS } from '../data/types';
import type { MatchResult } from '../utils/matching';
import {
  generateShareCard, generateCPCard, generateIdentityArchive,
  buildShareUrl, buildChallengeUrl,
} from '../utils/shareCards';
import type { ShareFormat } from '../utils/shareCards';

interface ResultsProps {
  result: MatchResult;
  onRestart: () => void;
  onViewOp?: (opId: string) => void;
  challengeCoords?: number[] | null;
}

const IMG = import.meta.env.BASE_URL + 'images/';

function charUrl(op: { portrait?: string; avatar: string }, fallback: boolean) {
  if (op.portrait) {
    return op.portrait.startsWith('skin/')
      ? IMG + op.portrait.replace('#', '%23')
      : IMG + 'portrait/' + op.portrait;
  }
  return fallback
    ? IMG + 'avatar/' + op.avatar.replace('#', '%23') + '.png'
    : IMG + 'skin/' + op.avatar.replace('#', '%23') + '_2b.png';
}

const FORMAT_LABELS: { key: ShareFormat; label: string }[] = [
  { key: 'wechat', label: '微信' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'bilibili', label: 'B站' },
];

export default function Results({ result, onRestart, onViewOp, challengeCoords }: ResultsProps) {
  const { t } = useTranslation();
  const { op, compatible, userCoords, ranking } = result;
  const [heroFallback, setHeroFallback] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const url = charUrl(op, heroFallback);
  const [showShare, setShowShare] = useState(false);
  const [shareImg, setShareImg] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareFormat, setShareFormat] = useState<ShareFormat>('wechat');
  const [cpImg, setCpImg] = useState('');
  const [archiveImg, setArchiveImg] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);

  const items = DIM_LABELS.map((label, i) => ({
    label, user: userCoords[i], op: op.coords[i]
  }));

  const top3 = ranking.slice(0, 3);

  const shareUrl = buildShareUrl(userCoords);
  const challengeUrl = buildChallengeUrl(userCoords);

  const shareIntro = compatible >= 80 ? t('results.compatLevel.soul') : compatible >= 60 ? t('results.compatLevel.deep') : t('results.compatLevel.surprise');
  const shareText = `🔮 罗德岛人格测试 · ${shareIntro}\n我与「${op.name}」的适配度高达 ${compatible}%\n「${op.title}」\n\n来测测看你会匹配到哪位干员 → ${shareUrl}`;

  const isWechat = /MicroMessenger/i.test(navigator.userAgent);

  // Challenge link detection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('challenge') === '1') setShowChallenge(true);
  }, []);

  const doGenerate = useCallback(async (fmt: ShareFormat) => {
    if (shareLoading) return;
    setShareLoading(true);
    setShareFormat(fmt);
    try {
      const img = await generateShareCard({
        format: fmt, op, compatible, userCoords, ranking, shareUrl,
      });
      setShareImg(img);
      setShowShare(true);
    } catch { /* silently fail */ }
    setShareLoading(false);
  }, [op, compatible, userCoords, ranking, shareUrl, shareLoading]);

  const downloadShareCard = useCallback(() => {
    if (!shareImg) return;
    const a = document.createElement('a');
    a.download = `arknights-${op.id}-${shareFormat}.jpg`;
    a.href = shareImg;
    a.click();
  }, [shareImg, op.id, shareFormat]);

  const handleWebShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title: '罗德岛干员人格测试', text: shareText, url: shareUrl }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      alert('分享链接已复制！' + (isWechat ? '\n请点击右上角 ··· 发送给朋友。' : ''));
    } catch {
      prompt('复制以下链接分享给好友：', shareUrl);
    }
  }, [shareText, shareUrl, isWechat]);

  const copyShareText = useCallback(() => {
    navigator.clipboard.writeText(shareText + '\n' + shareUrl);
  }, [shareText, shareUrl]);

  const copyChallengeLink = useCallback(() => {
    navigator.clipboard.writeText(
      `⚔️ 我测出来是「${op.name}」(${compatible}%)，猜猜你会是谁？\n${challengeUrl}`
    );
  }, [op.name, compatible, challengeUrl]);

  const handleCPCard = useCallback(async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      // Use second match from ranking for demo CP pairing
      const op2 = ranking[1]?.op || ranking[0].op;
      const coords1 = userCoords;
      const coords2 = op2.coords;
      // Euclidean distance → compatibility
      const dist = Math.sqrt(coords1.reduce((sum, c, i) => sum + (c - coords2[i]) ** 2, 0));
      const maxDist = Math.sqrt(500);
      const compat = Math.max(0, Math.round((1 - dist / maxDist) * 100));
      const img = await generateCPCard(op, coords1, op2, coords2, compat);
      setCpImg(img);
    } catch {}
    setShareLoading(false);
  }, [shareLoading, op, userCoords, ranking]);

  const handleIdentityArchive = useCallback(async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      const img = await generateIdentityArchive(op, userCoords, compatible);
      setArchiveImg(img);
    } catch {}
    setShareLoading(false);
  }, [shareLoading, op, userCoords, compatible]);

  const downloadArchive = useCallback(() => {
    if (!archiveImg) return;
    const a = document.createElement('a');
    a.download = `R.I.-${op.id}-archive.jpg`;
    a.href = archiveImg;
    a.click();
  }, [archiveImg, op.id]);

  const downloadCP = useCallback(() => {
    if (!cpImg) return;
    const a = document.createElement('a');
    a.download = `arknights-cp-${op.id}.jpg`;
    a.href = cpImg;
    a.click();
  }, [cpImg, op.id]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="result-content"
        className="flex flex-col items-center min-h-screen px-0 py-0"
      >
        {/* Hero section */}
        <div className="relative w-full overflow-hidden mb-0" style={{ minHeight: '85vh' }}>
          <div className="absolute inset-0 z-0 flex items-start justify-center">
            {!heroLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={url}
              alt={op.name}
              className="w-full h-full object-cover opacity-70"
              style={{ filter: 'brightness(0.55) saturate(1.1)', objectPosition: 'center 25%' }}
              onLoad={() => setHeroLoaded(true)}
              onError={(e) => {
                if (!op.portrait && !heroFallback) setHeroFallback(true);
                else (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(13,15,17,0.1) 0%, rgba(13,15,17,0.5) 50%, #0D0F11 100%)'
            }} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-end min-h-[85vh] px-8 pb-10 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="font-serif-en italic text-sm tracking-[0.15em] text-warm-dim mb-3">
                {t('results.subtitle')}
              </div>
              <h2 className="font-serif-en text-6xl font-normal tracking-[0.08em] text-white mb-2">
                {op.name}
              </h2>
              <p className="font-serif-cn text-base tracking-[0.08em] text-warm-muted mb-6">
                {op.title}
              </p>
              <p className="font-serif-cn text-sm leading-relaxed text-warm-muted/80 max-w-xs mb-5">
                {op.desc}
              </p>
              <div className="font-serif-en text-xs tracking-widest px-3 py-1 mb-4"
                style={{ color: op.color, border: `1px solid ${op.color}40` }}>
                {op.clazz}
              </div>
              <div className="ornament" style={{ margin: '8px 0' }}>· · ·</div>
            </motion.div>
          </div>
        </div>

        {/* Challenge banner */}
        {showChallenge && challengeCoords && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md px-6 mb-6">
            <div className="p-4 border border-lemon/20 bg-lemon-dim text-center">
              <p className="font-serif-cn text-sm text-lemon">
                你被朋友挑战了！下方可查看你们的兼容度。
              </p>
            </div>
          </motion.div>
        )}

        {/* Main content */}
        <div className="w-full max-w-md px-6">
          {/* Persona */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="section-label">{t('results.personaLabel')}</div>
            {op.persona.map((text, i) => (
              <p key={i} className="persona-text">{text}</p>
            ))}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {op.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </motion.div>

          <div className="ornament">· · ·</div>

          {/* Epigraph */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            dangerouslySetInnerHTML={{ __html: op.epigraph ? `<div class="epigraph">${op.epigraph}</div>` : '' }}
          />

          <div className="ornament">· · ·</div>

          {/* Soul */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="soul-card">
              <div className="soul-label">{t('results.soulLabel')}</div>
              <div className="soul-name">{op.name}</div>
              <div className="soul-name-cn">{op.title}</div>
              {op.soul.map((text, i) => (
                <p key={i} className="soul-text" dangerouslySetInnerHTML={{ __html: text }} />
              ))}
            </div>
          </motion.div>

          {/* Compatibility + Radar */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8">
            <div className="section-label">{t('results.compatibility')}</div>
            <div className="text-center mb-6">
              <span className="font-serif-en text-5xl text-white">{compatible}</span>
              <span className="font-serif-en text-lg text-warm-dim">%</span>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
            <RadarChart user={userCoords} operator={op.coords} color={op.color} opName={op.name} />
          </motion.div>

          {/* Dimension bars */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6">
            <div className="section-label">{t('results.dimensionLabel')}</div>
            <div className="flex flex-col gap-3">
              {items.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-warm-dim">{item.label}</span>
                    <span className="font-mono text-[0.55rem] text-warm-dim/70">
                      你 {item.user} · {op.name} {item.op}
                    </span>
                  </div>
                  <div className="h-px bg-white/5 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                      style={{ width: `${item.user * 10}%`, background: 'rgba(232,227,216,0.5)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="ornament">· · ·</div>

          {/* Top 3 matches */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.95 }}>
            <div className="section-label">{t('results.topMatches')}</div>
            <div className="flex flex-col gap-2 mb-6">
              {top3.map((m) => (
                <div key={m.op.id}
                  className="match-card flex items-center gap-3 p-3 bg-white/5 border border-white/10 cursor-pointer"
                  onClick={() => onViewOp?.(m.op.id)}
                >
                  <img
                    src={IMG + 'avatar/' + m.op.avatar.replace('#', '%23') + '.png'}
                    alt={m.op.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-serif-en text-sm text-white">{m.op.name}</span>
                    <span className="font-serif-cn text-[0.6rem] text-warm-dim" style={{ color: m.op.color }}>{m.op.title}</span>
                  </div>
                  <div className="ml-auto flex flex-col items-center shrink-0">
                    <span className="font-serif-en text-lg text-white">{m.compatible}</span>
                    <span className="font-mono text-[0.45rem] text-warm-dim">%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center gap-3 pb-6"
          >
            {/* Format switcher + generate */}
            <div className="flex gap-1 mb-1">
              {FORMAT_LABELS.map(f => (
                <button key={f.key}
                  onClick={() => doGenerate(f.key)}
                  disabled={shareLoading}
                  className="px-3 py-1 font-mono text-[0.5rem] tracking-wider text-warm-dim border border-white/10 hover:border-lemon/30 hover:text-lemon transition-colors disabled:opacity-40"
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => doGenerate('wechat')}
              disabled={shareLoading}
              className="inline-block px-10 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.25em] cursor-pointer transition-all duration-300 hover:bg-warm-white active:scale-[0.97] disabled:opacity-50"
            >
              {shareLoading ? '生成中...' : t('results.actions.shareCard')}
            </button>
            <button
              onClick={handleWebShare}
              className="inline-block px-10 py-3 bg-transparent text-warm-muted border border-white/20 font-serif-cn text-sm tracking-[0.25em] cursor-pointer transition-all duration-300 hover:text-warm-white hover:border-white/40 active:scale-[0.97]"
            >
              {isWechat ? t('results.wechat.share') : t('results.actions.share')}
            </button>

            <button onClick={handleCPCard} disabled={shareLoading}
                className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.15em] cursor-pointer border border-white/10 px-3 py-1.5 transition-all duration-200 hover:text-warm-muted hover:border-white/30 disabled:opacity-40">
                {t('results.actions.cpCard')}
              </button>
            <div className="flex gap-3 mt-2">
              <button onClick={handleIdentityArchive} disabled={shareLoading}
                className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.15em] cursor-pointer border border-white/10 px-3 py-1.5 transition-all duration-200 hover:text-warm-muted hover:border-white/30 disabled:opacity-40">
                {t('results.actions.identityArchive')}
              </button>
              <button onClick={copyChallengeLink}
                className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.15em] cursor-pointer border border-white/10 px-3 py-1.5 transition-all duration-200 hover:text-warm-muted hover:border-white/30">
                {t('results.actions.challenge')}
              </button>
            </div>

            <button
              onClick={onRestart}
              className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.2em] cursor-pointer border-b border-dotted border-warm-dim/40 pb-0.5 transition-all duration-200 hover:text-warm-muted hover:border-warm-muted mt-2"
            >
              {t('results.actions.restart')}
            </button>
          </motion.div>

          {isWechat && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="font-serif-cn text-xs text-warm-dim text-center mb-8">
              💡 {t('results.wechat.hint')}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setShowShare(false)}
        >
          <button className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setShowShare(false)}>&times;</button>
          {shareImg && (
            <>
              <img src={shareImg} alt={t('results.shareModal')} className="max-w-[90%] max-h-[65vh] rounded shadow-2xl" />
              <div className="flex gap-1 mt-3">
                {FORMAT_LABELS.map(f => (
                  <button key={f.key}
                    onClick={() => doGenerate(f.key)}
                    className={`px-3 py-1 font-mono text-[0.5rem] tracking-wider transition-colors ${
                      shareFormat === f.key ? 'text-lemon border border-lemon/40' : 'text-warm-dim border border-white/10 hover:text-warm-muted'
                    }`}
                  >{f.label}</button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={downloadShareCard}
                  className="px-8 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:bg-warm-white">
                  {t('results.actions.download')}
                </button>
                <button onClick={copyShareText}
                  className="px-8 py-3 bg-transparent text-warm-muted border border-white/20 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:text-warm-white hover:border-white/40">
                  {t('results.actions.copyText')}
                </button>
              </div>
              {isWechat && (
                <p className="mt-4 font-serif-cn text-xs text-warm-dim text-center">{t('results.wechat.modalHint')}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Identity Archive Modal */}
      {archiveImg && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setArchiveImg('')}
        >
          <button className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setArchiveImg('')}>&times;</button>
          <img src={archiveImg} alt="身份档案" className="max-w-[90%] max-h-[75vh] rounded shadow-2xl" />
          <div className="mt-4">
            <button onClick={downloadArchive}
              className="px-8 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:bg-warm-white">
              {t('results.actions.download')}
            </button>
          </div>
        </div>
      )}

      {/* CP Card Modal */}
      {cpImg && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setCpImg('')}
        >
          <button className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setCpImg('')}>&times;</button>
          <img src={cpImg} alt="CP卡片" className="max-w-[90%] max-h-[75vh] rounded shadow-2xl" />
          <div className="mt-4">
            <button onClick={downloadCP}
              className="px-8 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:bg-warm-white">
              {t('results.actions.download')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
