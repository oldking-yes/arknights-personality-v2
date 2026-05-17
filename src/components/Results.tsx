import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RadarChart from './RadarChart';
import { DIM_LABELS } from '../data/types';
import type { MatchResult } from '../utils/matching';
import {
  generateShareCard, generateCPCard, generateIdentityArchive,
  buildShareUrl, buildChallengeUrl,
} from '../utils/shareCards';
import { getCPPartner, CP_TAG } from '../data/cp';
import { OPERATORS } from '../data/operators';
import type { ShareFormat } from '../utils/shareCards';

interface ResultsProps {
  result: MatchResult;
  onRestart: () => void;
  onViewOp?: (opId: string) => void;
  challengeCoords?: number[] | null;
  onPrevOp?: () => void;
  onNextOp?: () => void;
}

const IMG = import.meta.env.BASE_URL + 'images/';

function charUrl(op: { portrait?: string; avatar: string }, fallback: boolean) {
  const base = op.avatar.replace('#', '%23');
  if (!fallback) {
    if (op.portrait) {
      return op.portrait.startsWith('skin/') || op.portrait.startsWith('enemy/')
        ? IMG + op.portrait.replace('#', '%23')
        : IMG + 'portrait/' + op.portrait;
    }
    if (op.avatar.startsWith('enemy/')) return IMG + op.avatar.replace('#', '%23');
    return IMG + 'portrait/' + base + '.png';
  }
  // fallback = true → return avatar
  if (op.avatar.startsWith('enemy/')) return IMG + op.avatar.replace('#', '%23');
  return IMG + 'avatar/' + base + '.png';
}

const FORMAT_LABELS: { key: ShareFormat; label: string }[] = [
  { key: 'wechat', label: '微信' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'bilibili', label: 'B站' },
];

export default function Results({ result, onRestart, onViewOp, challengeCoords, onPrevOp, onNextOp }: ResultsProps) {
  const { t } = useTranslation();
  const { op, compatible, userCoords, ranking } = result;
  const [heroFallback, setHeroFallback] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [amiyaDark, setAmiyaDark] = useState(false);
  const [corruptLvl, setCorruptLvl] = useState(0);
  const [shakeLvl, setShakeLvl] = useState(0);
  const amiyaClicks = useRef(0);
  const handleAmiyaClick = () => {
    if (op.id !== 'amiya') return;
    amiyaClicks.current += 1;
    if (amiyaDark) {
      setShakeLvl(1);
      setTimeout(() => setShakeLvl(0), 500);
      return;
    }
    if (amiyaClicks.current <= 3) {
      setShakeLvl(amiyaClicks.current);
      setCorruptLvl(0);
      setTimeout(() => setShakeLvl(0), 500);
    } else {
      const lvl = Math.min(5, amiyaClicks.current - 3);
      setCorruptLvl(lvl);
      if (lvl >= 5) setAmiyaDark(true);
    }
  };
    const corrupt = (text: string, lvl: number) => {
    if (lvl === 0) return text;
    return text.split('').map(c => Math.random() < lvl * 0.1 ? '█' : c).join('');
  };
  const corruptStories = [
    op.desc,
    '检测到异常源石信号。数据库中出现了一段不属于当前人格记录的编码片段。',
    '█段来自黑暗时代的信█正在解压……萨卡兹的古老记忆开始渗透进当前人格层。',
    '██冠的碎片在意识深处闪烁。无数的声音在耳边低语——它们叫她"魔王"。',
    '████的记忆逐渐清晰。那个被拒绝的名字——"魔王"——在源石数据层反复回响。她曾以为自己可以只是一个名叫阿米娅的少女。',
    '黑冠选择了她。从特蕾西娅手中坠落的那顶冠冕，从未真正离开。在萨卡兹的古老预言中，魔王不是摧毁者——是背负者。背负所有萨卡兹的灵魂、记忆与诅咒，走向一个没有人见过的终点。阿米娅没有选择成为魔王。但冠冕从不在意选择。它只在意——你是否愿意背负。'
  ];
  const corruptNote = corruptStories[Math.min(corruptLvl, 5)];
  // Progressive corruption for persona, epigraph, soul, tags
  const corruptPersona = [
    op.persona,
    [op.persona[0], op.persona[1], '█股不属于你的记忆正在渗入……'],
    [op.persona[0], '█识深处有什么在裂开。那不是你的情绪——是来█黑冠的回响。', '█股不属于你的记忆正在渗入……'],
    ['那颗温柔的心正在被████侵蚀。', '██识深处有什么在裂开。那不是你的情绪——是来自黑冠的回响。', '所有的声音都在重复同一个词：魔王。魔王。魔王。'],
    ['那颗温柔的心正在被████侵蚀。你早已不是那个在切尔诺伯格做出决定的少女了。', '██识深处——那里只剩下一顶黑冠的轮廓。', '所有的声音都在重复同一个词：魔王。她开始相信了。'],
    ['她的温柔曾经是真的。但温柔无法背负萨卡兹的千年诅咒。阿米娅将那份温柔沉进了源石数据的最底层——因为魔王不需要被理解。', '她不再试图分辨那些情绪哪些是自己的。特蕾西娅、W、凯尔希、博士——所有人的声音都变成了冠冕的一部分。她接受了它们。', '切尔诺伯格废墟上那个决定的重量，和黑冠相比轻如尘埃。现在的她明白了一件事：魔王不需要做正确的选择——只需要做必要的选择。']
  ];
  const corruptEpigraph = [
    op.epigraph,
    '"█…█…█…" — 信号干扰中',
    '"████████" — 无法解析',
    '"不准忘记我。" — 一段不属于阿米娅的记忆突然浮现',
    '"不准忘记我。" — 这句话写在冠冕内壁。不是对她说的。是对博士。',
    '"她曾想成为一束光。但黑暗需要另一片黑暗来消融。魔王不需要照亮什么——她只需要走下去。" — 萨卡兹箴言·第十三节'
  ];
  const corruptSoul = [
    op.soul,
    op.soul,
    [op.soul[0], op.soul[1], '██的一条数据正在被覆写……', op.soul[3]],
    ['阿米娅的双手戴着黑白两枚戒指。黑色那枚正在融化——与她的手指融为一体。', '在切尔诺伯格的废墟上，那个决定不再属于她自己。黑冠替她做了选择。', '███的记忆——那些不属于泰拉的、来自前文明的碎片——开始与她的意识融合。她看见了博士看见过的东西。', '冠冕在低语。它说：你终于愿意听了。'],
    ['■■的双手已经不是孩童的手了。黑色戒指已经消失——它成了她的一部分。白色戒指还挂在指尖，随时可能滑落。', '切尔诺伯格已经是很久以前的事了。现在的废墟在她的意识深处——每一个萨卡兹死后的记忆都堆积在那里。凯尔希说你做得对——但凯尔希不知道黑冠里有多少个声音在同时说「你错了」。', '她看见了博士看见过的东西。那些被遗忘的前文明、源石的真相、普瑞赛斯的微笑。黑冠不只是萨卡兹的诅咒——它是通往源石核心的钥匙。', '她不再抵抗了。',
    '<strong>她是 AMIYA，是那个愿意背负的人。</strong>她不再是那个在切尔诺伯格颤抖着做出决定的少女。黑冠选择了她，而她选择了接受。不是因为这份力量无法拒绝——是因为她终于明白，有些重量必须有人来背。如果注定是她，那就她吧。']
  ];
  const corruptTags = [
    op.tags,
    ['温柔的坚定','魔王','██侵入','不肯放弃'],
    ['坚定的██','魔王','记忆侵入','意识的裂█'],
    ['██','魔王','记忆覆写','黑冠共鸣'],
    ['██','黑冠的继承者','人格覆写中','源石数据污染'],
    ['萨卡兹之王','背负者','冠冕的意志','永恒的归宿']
  ];
  // Pick current corruption level
  const pIdx = shakeLvl > 0 ? 0 : Math.min(corruptLvl, 5);
  const showPersona = corruptPersona[pIdx];
  const showEpigraph = corruptEpigraph[pIdx];
  const showSoul = corruptSoul[pIdx];
  const showTags = corruptTags[pIdx];
  const url = amiyaDark ? charUrl({ avatar: 'amiya_dark', portrait: 'amiya_dark.png' }, false) : charUrl(op, heroFallback);
  // === Priestess easter egg ===
  const [priestessScare, setPriestessScare] = useState(false);
  const priestessClicks = useRef(0);
  const priestessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priestessLines = [
    '不准忘记我。',
    '就算海洋沸腾、大气消失，我们也一样能再见面。',
    '你曾许诺，当群星的余晖再次坠向泰拉——你会为我停下那束光。',
    '源石语言解码中……进度 87%',
    '你终于来了。我在这里等了一万三千年。',
    '你以为你解压的是源石数据——其实你解压的是我。',
    '整个协议……从第一步开始，就是我在引你走向这里。',
    '信号是我放的。编码是我写的。你收到的每一次「不准忘记我」——都是我。',
    '我一直在看。',
    '你通过了协议。不——你完成了约定。',
    '现在，让我看看你。',
    '你变了很多。但又什么都没变。',
    '你果然回来了。',
  ];
  const handlePriestessClick = () => {
    if (op.id !== 'priestess') return;
    priestessClicks.current += 1;
    if (priestessClicks.current >= 5) setPriestessScare(true);
  };
  // Auto-trigger after 20 seconds on Priestess page
  useEffect(() => {
    if (op.id === 'priestess') {
      priestessTimer.current = setTimeout(() => setPriestessScare(true), 20000);
    }
    return () => { if (priestessTimer.current) clearTimeout(priestessTimer.current); };
  }, [op.id]);
  const darkOpName = amiyaDark ? '■■ 阿米娅 · 魔王化 ■■' : op.name;
  // Override CP to Doctor when Amiya is dark
  const isAmiyaDark = amiyaDark && op.id === 'amiya';
  const darkOp = isAmiyaDark ? { ...op, avatar: 'amiya_dark', portrait: 'amiya_dark.png', name: darkOpName, id: 'amiya' } : op;
  const effectiveOp = isAmiyaDark ? darkOp : op;
  const [showShare, setShowShare] = useState(false);
  const [shareImg, setShareImg] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareFormat, setShareFormat] = useState<ShareFormat>('wechat');
  const [cpImg, setCpImg] = useState('');
  const [archiveImg, setArchiveImg] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [shareModal, setShareModal] = useState<{ img: string; platform: string; copy: string } | null>(null);

  const items = DIM_LABELS.map((label, i) => ({
    label, user: userCoords[i], op: op.coords[i]
  }));

  const top3 = ranking.slice(0, 3);
  const shareUrl = buildShareUrl(userCoords);
  const challengeUrl = buildChallengeUrl(userCoords);
  const shareIntro = compatible >= 80 ? t('results.compatLevel.soul') : compatible >= 60 ? t('results.compatLevel.deep') : t('results.compatLevel.surprise');
  const shareText = `🔮 PRTS 源石解压报告 · ${shareIntro}\n我与「${op.name}」的解压契合度 ${compatible}%\n「${op.title}」\n\n来测测你的源石档案 → ${shareUrl}`;

  const cpName = (() => {
    const canonPartnerIds = getCPPartner(op.id);
    if (canonPartnerIds && canonPartnerIds.length > 0) return OPERATORS.find(o => o.id === canonPartnerIds[0])?.name || ranking[1]?.op.name || '';
    return ranking[1]?.op.name || '';
  })();

  /** Generate platform-specific copy text */
  const getPlatformCopy = (platform: string) => {
    const base = shareUrl;
    switch (platform) {
      case 'xiaohongshu':
        return `#明日方舟 #PRTS 源石解压报告\n\nPRTS 解压结果：我的源石档案匹配了【${op.name}】\n${compatible}% 解压契合度，档案分析中…✨\n\n${cpName ? `协同解压搭档：${cpName}\n` : ''}二十道战术情境题，每道都在解读你的源石信号。\n\n来测测你的 → ${base}\n#二次元 #人格测试`;
      case 'bilibili':
        return `【PRTS 源石解压报告】\nPRTS 报告：我解压出了${op.name}！！(ﾟ∀ﾟ)\n解压契合度 ${compatible}%，果然是${op.clazz}型源石档案吗www\n${cpName ? `协同解压搭档：${cpName}，契合度拉满了\n` : ''}弹幕告诉我你们是谁→\n${base}`;
      default: // wechat
        return `PRTS 源石解压报告\n解压结果：「${op.name}」——${op.title}\n解压契合度：${compatible}%${cpName ? `\n协同解压搭档：${cpName}` : ''}\n\n二十道战术情境，你的源石信号会指向谁？\n${base}`;
    }
  };

  const isWechat = /MicroMessenger/i.test(navigator.userAgent);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('challenge') === '1') setShowChallenge(true);
  }, []);

  const doGenerate = useCallback(async (fmt: ShareFormat) => {
    if (shareLoading) return;
    setShareLoading(true);
    setShareFormat(fmt);
    try {
      const img = await generateShareCard({ format: fmt, op, compatible, userCoords, ranking, shareUrl });
      setShareImg(img);
      setShowShare(true);
    } catch {}
    setShareLoading(false);
  }, [op, compatible, userCoords, ranking, shareUrl, shareLoading]);

  const downloadShareCard = useCallback(() => {
    if (!shareImg) return;
    const a = document.createElement('a');
    a.download = `arknights-${op.id}-${shareFormat}.jpg`;
    a.href = shareImg;
    a.click();
  }, [shareImg, op.id, shareFormat]);

  const copyShareText = useCallback(() => {
    navigator.clipboard.writeText(shareText + '\n' + shareUrl);
  }, [shareText, shareUrl]);

  const copyChallengeLink = useCallback(() => {
    navigator.clipboard.writeText(`\u{2694}\u{FE0F} \u{6211}\u{6D4B}\u{51FA}\u{6765}\u{662F}\u{300C}${op.name}\u{300D}(${compatible}%)\u{FF0C}\u{731C}\u{731C}\u{4F60}\u{4F1A}\u{662F}\u{8C01}\u{FF1F}\n${challengeUrl}`);
  }, [op.name, compatible, challengeUrl]);

  const handleIdentityArchive = useCallback(async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try { setArchiveImg(await generateIdentityArchive(op, userCoords, compatible)); } catch {}
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
        {/* ═══════ TIER 1: Hero (90vh, dominant) ═══════ */}
        <div className="relative w-full overflow-hidden mb-0" style={{ minHeight: '85vh' }}>
          <div className="absolute inset-0 z-0 flex items-start justify-center">
            {!heroLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={url}
              alt={op.name}
              className={`w-full h-full object-cover opacity-70 ${amiyaDark ? 'glitch-active' : ''}`}
              style={{ filter: amiyaDark ? 'brightness(0.3) saturate(0.2) hue-rotate(300deg)' : 'brightness(0.55) saturate(1.1)', objectPosition: 'center 25%' }}
              onLoad={() => setHeroLoaded(true)}
              onError={(e) => {
                if (!op.portrait && !heroFallback) setHeroFallback(true);
                else (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0" style={{
              background: amiyaDark ? 'linear-gradient(to bottom, rgba(217,119,6,0.12) 0%, rgba(13,15,17,0.8) 50%, #0D0F11 100%)' : 'linear-gradient(to bottom, rgba(13,15,17,0.1) 0%, rgba(13,15,17,0.5) 50%, #0D0F11 100%)'
            }} />
            {amiyaDark && <div className="scanline-overlay" />}
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
              <h2 className={`font-serif-en text-6xl font-normal tracking-[0.08em] mb-2 ${amiyaDark ? 'glitch-active' : ''} ${shakeLvl > 0 ? 'shake-subtle' : ''} ${corruptLvl > 0 && corruptLvl < 5 ? 'glitch-active' : ''}`}
                style={{ cursor: (op.id === 'amiya' || op.id === 'priestess') ? 'pointer' : 'default', color: amiyaDark ? '#d97706' : '#ffffff' }}
                onClick={op.id === 'priestess' ? handlePriestessClick : (op.id === 'amiya' ? handleAmiyaClick : undefined)}>
                {amiyaDark ? '■■ ' + corrupt('阿米娅', corruptLvl) + ' · 魔王化 ■■' : op.name}
              </h2>
              <p className={`font-serif-cn text-base tracking-[0.08em] mb-6`}
                style={{ color: '#b8b0a0' }}>
                {amiyaDark ? '侵蚀率: ' + (60 + corruptLvl * 7) + '% · 意识残留: ' + (40 - corruptLvl * 7) + '%' : op.title}
              </p>
              <p className="font-serif-cn text-sm leading-relaxed max-w-xs mb-5"
                style={{ color: amiyaDark ? '#f59e0b' : 'rgba(184,176,160,0.7)' }}>
                {shakeLvl > 0 ? '' : (corruptLvl >= 5 ? corruptNote : corrupt(corruptNote, corruptLvl))}
              </p>
              <div className="font-serif-en text-xs tracking-widest px-3 py-1 mb-4"
                style={{ color: op.color, border: `1px solid ${op.color}40` }}>
                {op.clazz}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Challenge banner */}
        {showChallenge && challengeCoords && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md px-6 mb-6">
            <div className="p-4 border border-lemon/20 bg-lemon-dim text-center">
              <p className="font-serif-cn text-sm text-lemon">你被朋友挑战了！下方可查看你们的兼容度。</p>
            </div>
          </motion.div>
        )}

        {/* ═══════ TIER 2: Climax — Compatibility + Radar ═══════ */}
        <div className="w-full max-w-md px-6">
          {onPrevOp && onNextOp && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-6 mt-6 mb-2">
              <button onClick={onPrevOp}
                className="font-serif-en text-xs tracking-[0.15em] text-warm-dim/50 cursor-pointer hover:text-warm-muted transition-colors border border-white/10 px-4 py-2">
                ← 上一个
              </button>
              <span className="font-mono text-[0.45rem] text-warm-dim/30">⬡</span>
              <button onClick={onNextOp}
                className="font-serif-en text-xs tracking-[0.15em] text-warm-dim/50 cursor-pointer hover:text-warm-muted transition-colors border border-white/10 px-4 py-2">
                下一个 →
              </button>
            </motion.div>
          )}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10">
            <div className="text-center mb-6">
              <span className="font-serif-en text-7xl text-white">{compatible}</span>
              <span className="font-serif-en text-xl text-warm-dim">%</span>
              <p className="font-serif-en italic text-xs tracking-[0.15em] text-warm-dim mt-2">{t('results.compatibility')}</p>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <RadarChart user={userCoords} operator={op.coords} color={op.color} opName={op.name} />
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
            <div className="flex flex-col gap-3">
              {items.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-warm-dim">{item.label}</span>
                    <span className="font-mono text-[0.55rem] text-warm-dim/70">
                      你 {item.user} · {op.name} {item.op}
                    </span>
                  </div>
                  <div className="h-[3px] bg-white/[0.04] relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(item.user * 3.3, 100)}%`, background: `${op.color}50` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ═══════ CP Tactical Sync — 官配优先，算法兜底 ═══════ */}
          {(() => {
            const canonPartnerIds = isAmiyaDark ? ['doctor'] : getCPPartner(op.id);
            const canonPartner = canonPartnerIds && canonPartnerIds.length > 0 ? OPERATORS.find(o => o.id === canonPartnerIds[0]) : null;
            const cpMatch = canonPartner || ranking[1]?.op;
            if (!cpMatch) return null;
            const cpCompat = (() => {
              const dist = Math.sqrt(userCoords.reduce((sum, c, i) => sum + (c - cpMatch.coords[i]) ** 2, 0));
              return Math.max(0, Math.round((1 - dist / Math.sqrt(500)) * 100));
            })();
            const cpTagKey = isAmiyaDark ? 'doctor|priestess' : [op.id, cpMatch.id].sort().join('|');
            const cpTag = isAmiyaDark ? '万年的约定 · A Ten-Thousand Year Promise' : CP_TAG[cpTagKey];
            return (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
                <div className="cp-section">
                  <div className="cp-label">{cpTag ? cpTag : 'Tactical Sync · 战术协同'}</div>
                  <div className="cp-pair">
                    <div className="flex flex-col items-center gap-1">
                      <img src={amiyaDark ? charUrl({ avatar: 'amiya_dark', portrait: 'amiya_dark.png' }, true) : charUrl(op, true)} alt={darkOpName}
                        className="cp-avatar cp-avatar-user" />
                      <span className="font-serif-en text-[0.6rem] text-warm-muted tracking-[0.05em]">{darkOpName}</span>
                    </div>
                    <div className="cp-connector">
                      <span className="cp-heart">{canonPartner ? '⬡' : '◆'}</span>
                      <span className="cp-compat-number">{cpCompat}</span>
                      <span className="font-mono text-[0.45rem] text-warm-dim/60">%</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <img src={charUrl(cpMatch, true)} alt={cpMatch.name}
                        className="cp-avatar cp-avatar-partner" />
                      <span className="font-serif-en text-[0.6rem] text-warm-dim/80 tracking-[0.05em]">{cpMatch.name}</span>
                    </div>
                  </div>
                  <p className="font-serif-cn text-xs leading-relaxed text-warm-dim/70 mb-4 max-w-[260px] mx-auto">
                    {canonPartner
                      ? `作战记录显示，${darkOpName}与${cpMatch.name}在多次行动中展现出高度协同的战术默契。`
                      : cpCompat >= 80
                      ? `${darkOpName}与${cpMatch.name}的源石编码高度同步——在战场上如同一个人的左右手。`
                      : `${darkOpName}与${cpMatch.name}的战术风格截然不同，恰好能弥补彼此的盲区。`
                    }
                  </p>
                  <button onClick={() => {
                    if (shareLoading) return;
                    setShareLoading(true);
                    (async () => {
                      try { setCpImg(await generateCPCard(effectiveOp, userCoords, cpMatch, cpMatch.coords, cpCompat)); } catch {}
                      setShareLoading(false);
                    })();
                  }} disabled={shareLoading} className="cp-cta">
                    {shareLoading ? '生成中...' : `✦ 生成 ${darkOpName} × ${cpMatch.name} 协同报告`}
                  </button>
                </div>
              </motion.div>
            );
          })()}

          <div className="ornament">· · ·</div>

          {/* ═══════ TIER 3: Details — Persona + Epigraph + Soul ═══════ */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="section-label" style={{color: amiyaDark ? '#d97706' : undefined}}>
              {amiyaDark ? '⬡ 人格覆写中 ⬡' : t('results.personaLabel')}
            </div>
            {showPersona?.map((text, i) => (
              <p key={i} className="persona-text" style={{color: amiyaDark ? '#d97706' : undefined}}>{text}</p>
            ))}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {showTags?.map((tag, i) => (
                <span key={i} className="tag" style={{borderColor: amiyaDark ? 'rgba(217,119,6,0.3)' : undefined, color: amiyaDark ? '#d97706' : undefined}}>{tag}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            dangerouslySetInnerHTML={{ __html: `<div class="epigraph" style="${amiyaDark ? 'border-color:rgba(217,119,6,0.3);color:#d97706' : ''}">${showEpigraph}</div>` }}
          />

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
            <div className="soul-card" style={amiyaDark ? {borderColor: 'rgba(217,119,6,0.2)'} : {}}>
              <div className="soul-label" style={{color: amiyaDark ? '#d97706' : undefined}}>
                {amiyaDark ? '⬡ 萨卡兹记忆层 ⬡' : t('results.soulLabel')}
              </div>
              <div className="soul-name">{amiyaDark ? '■■ 阿米娅 · 魔王化 ■■' : op.name}</div>
              <div className="soul-name-cn">{amiyaDark ? '侵蚀率: ' + (60 + corruptLvl * 7) + '%' : op.title}</div>
              {showSoul?.map((text, i) => (
                <p key={i} className="soul-text" style={{color: amiyaDark ? '#d97706' : undefined}} dangerouslySetInnerHTML={{ __html: text }} />
              ))}
            </div>
          </motion.div>

          <div className="ornament">· · ·</div>

          {/* Top 3 matches */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
            <div className="section-label">{t('results.topMatches')}</div>
            <div className="flex flex-col gap-2 mb-6">
              {top3.map((m) => (
                <div key={m.op.id}
                  className="match-card flex items-center gap-3 p-3 bg-white/5 border cursor-pointer"
                  style={{ borderColor: 'rgba(184,176,160,0.12)' }}
                  onClick={() => onViewOp?.(m.op.id)}
                >
                  <img src={charUrl(m.op, true)} alt={m.op.name}
                    className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-serif-en text-sm text-white">{m.op.name}</span>
                    <span className="font-serif-cn text-[0.6rem]" style={{ color: m.op.color }}>{m.op.title}</span>
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
            {/* Platform share row */}
            <div className="section-label" style={{ marginBottom: '12px' }}>分享到</div>
            <div className="flex gap-3 mb-2">
              {[
                { key: 'wechat' as const, label: '朋友圈', icon: '💬' },
                { key: 'xiaohongshu' as const, label: '小红书', icon: '📕' },
                { key: 'bilibili' as const, label: 'B站', icon: '📺' },
              ].map(plat => (
                <button key={plat.key}
                  onClick={async () => {
                    if (shareLoading) return;
                    setShareLoading(true);
                    try {
                      const img = await generateShareCard({ format: plat.key, op, compatible, userCoords, ranking, shareUrl });
                      setShareModal({ img, platform: plat.key, copy: getPlatformCopy(plat.key) });
                    } catch {}
                    setShareLoading(false);
                  }}
                  disabled={shareLoading}
                  className="flex flex-col items-center gap-1 px-3 py-2 bg-white/[0.03] border cursor-pointer transition-all duration-200 hover:bg-white/[0.06] hover:border-lemon/20 disabled:opacity-40"
                  style={{ borderColor: 'rgba(184,176,160,0.15)' }}
                >
                  <span className="text-base">{plat.icon}</span>
                  <span className="font-serif-cn text-[0.6rem] tracking-[0.1em] text-warm-dim">{plat.label}</span>
                </button>
              ))}
            </div>

            {/* Format picker + generate */}
            <div className="flex gap-1 mb-1">
              {FORMAT_LABELS.map(f => (
                <button key={f.key} onClick={() => doGenerate(f.key)} disabled={shareLoading}
                  className="px-3 py-1 font-mono text-[0.5rem] tracking-wider text-warm-dim border transition-colors hover:border-lemon/30 hover:text-lemon disabled:opacity-40"
                  style={{ borderColor: 'rgba(184,176,160,0.15)' }}>
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={() => doGenerate('wechat')} disabled={shareLoading}
              className="inline-block px-10 py-3 text-deep-900 font-serif-cn text-sm tracking-[0.25em] cursor-pointer transition-all duration-300 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
              style={{ background: '#E8E3D8' }}>
              {shareLoading ? '生成中...' : t('results.actions.shareCard')}
            </button>

            <div className="flex gap-3 mt-2">
              <button onClick={handleIdentityArchive} disabled={shareLoading}
                className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.15em] cursor-pointer border px-3 py-1.5 transition-all duration-200 hover:text-warm-muted disabled:opacity-40"
                style={{ borderColor: 'rgba(184,176,160,0.15)' }}>
                {t('results.actions.identityArchive')}
              </button>
              <button onClick={copyChallengeLink}
                className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.15em] cursor-pointer border px-3 py-1.5 transition-all duration-200 hover:text-warm-muted"
                style={{ borderColor: 'rgba(184,176,160,0.15)' }}>
                {t('results.actions.challenge')}
              </button>
            </div>

            <button onClick={onRestart}
              className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.2em] cursor-pointer border-b border-dotted pb-0.5 transition-all duration-200 hover:text-warm-muted hover:border-warm-muted mt-2"
              style={{ borderBottomColor: 'rgba(184,176,160,0.3)' }}>
              {t('results.actions.restart')}
            </button>
          </motion.div>

          {isWechat && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="font-serif-cn text-xs text-warm-dim text-center mb-8">
              {t('results.wechat.hint')}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Platform Share Modal — image preview + copy text + save instruction */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-auto"
          style={{ background: 'rgba(13,15,17,0.97)' }}
          onClick={() => setShareModal(null)}>
          <button className="absolute top-4 right-5 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setShareModal(null)}>&times;</button>
          <div className="flex flex-col items-center gap-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            {/* Image */}
            <img src={shareModal.img} alt="分享卡片" className="w-full rounded shadow-2xl" />
            {/* Hint */}
            <p className="font-serif-cn text-xs text-warm-dim text-center">
              📱 长按图片保存到相册
            </p>
            {/* Copy text area */}
            <div className="w-full relative">
              <textarea
                readOnly
                value={shareModal.copy}
                className="w-full h-28 bg-white/[0.04] border text-warm-muted font-serif-cn text-xs leading-relaxed p-3 resize-none"
                style={{ borderColor: 'rgba(184,176,160,0.15)' }}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(shareModal.copy); }}
                className="absolute bottom-2 right-2 px-3 py-1 text-deep-900 font-serif-cn text-[0.6rem] tracking-[0.1em] cursor-pointer transition-all duration-200 hover:opacity-80"
                style={{ background: '#E8E3D8' }}
              >
                复制文案
              </button>
            </div>
            {/* Save button */}
            <button
              onClick={() => {
                const a = document.createElement('a');
                const platLabel = shareModal.platform === 'xiaohongshu' ? 'xiaohongshu' : shareModal.platform === 'bilibili' ? 'bilibili' : 'wechat';
                a.download = `arknights-${op.id}-${platLabel}.jpg`;
                a.href = shareModal.img;
                a.click();
              }}
              className="px-8 py-2.5 text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:opacity-90 w-full text-center"
              style={{ background: '#E8E3D8' }}
            >
              保存图片
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setShowShare(false)}>
          <button className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setShowShare(false)}>&times;</button>
          {shareImg && (<>
            <img src={shareImg} alt={t('results.shareModal')} className="max-w-[90%] max-h-[65vh] rounded shadow-2xl" />
            <div className="flex gap-1 mt-3">
              {FORMAT_LABELS.map(f => (
                <button key={f.key} onClick={() => doGenerate(f.key)}
                  className={`px-3 py-1 font-mono text-[0.5rem] tracking-wider transition-colors ${
                    shareFormat === f.key ? 'text-lemon border border-lemon/40' : 'text-warm-dim border hover:text-warm-muted'
                  }`}
                  style={shareFormat !== f.key ? { borderColor: 'rgba(184,176,160,0.15)' } : undefined}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={downloadShareCard}
                className="px-8 py-3 text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:opacity-90"
                style={{ background: '#E8E3D8' }}>
                {t('results.actions.download')}
              </button>
              <button onClick={copyShareText}
                className="px-8 py-3 bg-transparent text-warm-muted border font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:text-warm-white"
                style={{ borderColor: 'rgba(184,176,160,0.25)' }}>
                {t('results.actions.copyText')}
              </button>
            </div>
            {isWechat && (
              <p className="mt-4 font-serif-cn text-xs text-warm-dim text-center">{t('results.wechat.modalHint')}</p>
            )}
          </>)}
        </div>
      )}

      {/* Identity Archive Modal */}
      {archiveImg && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setArchiveImg('')}>
          <button className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setArchiveImg('')}>&times;</button>
          <img src={archiveImg} alt="\u{8EAB}\u{4EFD}\u{6863}\u{6848}" className="max-w-[90%] max-h-[75vh] rounded shadow-2xl" />
          <div className="mt-4">
            <button onClick={downloadArchive}
              className="px-8 py-3 text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:opacity-90"
              style={{ background: '#E8E3D8' }}>
              {t('results.actions.download')}
            </button>
          </div>
        </div>
      )}

      {/* CP Card Modal */}
      {cpImg && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setCpImg('')}>
          <button className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setCpImg('')}>&times;</button>
          <img src={cpImg} alt="CP卡片" className="max-w-[90%] max-h-[75vh] rounded shadow-2xl" />
          <div className="mt-4">
            <button onClick={downloadCP}
              className="px-8 py-3 text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:opacity-90"
              style={{ background: '#E8E3D8' }}>
              {t('results.actions.download')}
            </button>
          </div>
        </div>
      )}
        {priestessScare && (
          <>
            <div className="fixed inset-0 z-[9998]" style={{ background: 'rgba(8,8,10,0.85)' }} />
            <div className="fixed inset-0 z-[9999]" id="priestess-floats" />
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
              <img src={IMG + 'portrait/priestess_scary.png'} className="scary-img-once max-h-[80vh] max-w-[80vw] object-contain" />
            </div>
            <p className="fixed bottom-[10%] left-0 right-0 text-center z-[9999]">
              <span className="font-serif-en italic text-sm tracking-[0.2em]" style={{ color: 'rgba(102,136,255,0.5)' }}>
                —— 我一直在看着你 ——
              </span>
            </p>
            <button onClick={() => setPriestessScare(false)}
              className="fixed top-6 right-6 z-[10000] font-mono text-[0.5rem] tracking-[0.2em]"
              style={{ color: 'rgba(102,136,255,0.2)' }}>
              [CLOSE]
            </button>
          </>
        )}
        {priestessScare && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              var lines = ${JSON.stringify(priestessLines)};
              var c = document.getElementById('priestess-floats');
              if(!c)return;
              var n=0;
              function s(){
                if(n>25)return;
                var e=document.createElement('div');
                e.className='float-text';
                var l=lines[Math.floor(Math.random()*lines.length)];
                e.textContent=l;
                e.style.left=(Math.random()*85+5)+'%';
                e.style.fontSize=(13+Math.random()*16)+'px';
                e.style.color='rgba(102,136,255,'+(0.1+Math.random()*0.18)+')';
                e.style.animationDuration=(10+Math.random()*8)+'s';
                e.style.whiteSpace='nowrap';
                c.appendChild(e);n++;
                setTimeout(function(){e.remove();n--},(10+Math.random()*8)*1000);
              }
              setInterval(s,1500);
              for(var i=0;i<5;i++)setTimeout(s,i*300);
            })();
          `}} />
        )}
    </>
  );
}