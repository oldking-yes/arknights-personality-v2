/**
 * Canon CP pairings across the full 32-operator roster.
 * If user matches one member, the canon partner is shown as CP instead of algorithm match.
 */
export const CANON_CP: Record<string, string[]> = {
  texas: ['lappland'],
  lappland: ['texas'],
  chen: ['hoshiguma'],
  hoshiguma: ['chen'],
  exusiai: ['mostima'],
  mostima: ['exusiai'],
  saria: ['silence'],
  silence: ['saria'],
  kristen: ['saria'],
  patriot: ['frostnova'],
  frostnova: ['patriot'],
  amiya: ['theresa'],
  theresa: ['amiya', 'w'],
  w: ['theresa', 'talulah'],
  talulah: ['w'],
  doctor: ['priestess', 'kaltsit'],
  priestess: ['doctor'],
  kaltsit: ['doctor'],
  skadi: ['ulpianus', 'isharmla'],
  ulpianus: ['skadi'],
  isharmla: ['skadi'],
  silverash: ['pramanix'],
  pramanix: ['silverash'],
  blaze: ['logos'],
  logos: ['blaze'],
  chongyue: ['ling'],
  ling: ['chongyue'],
  emperorblade: ['collapsal'],
  collapsal: ['emperorblade'],
  warfarin: ['eyja'],
  eyja: ['warfarin'],
  sui: ['ling'],
};

/** CP display names for UI */
export const CP_TAG: Record<string, string> = {
  'texas|lappland': '双狼 · Twin Wolves',
  'chen|hoshiguma': '龙门搭档 · Lungmen Partners',
  'exusiai|mostima': '红蓝天使 · Crimson & Azure',
  'saria|silence': '莱茵的羁绊 · Rhine Bond',
  'patriot|frostnova': '雪原父女 · Snowfield Father & Daughter',
  'amiya|theresa': '王冠的传承 · Crown\'s Legacy',
  'w|theresa': '不灭的忠诚 · Undying Loyalty',
  'w|talulah': '同源的火焰 · Flame of the Same Source',
  'doctor|priestess': '万年的约定 · A Ten-Thousand Year Promise',
  'doctor|kaltsit': '造物与造主 · Creator and Creation',
  'skadi|ulpianus': '深海猎人的羁绊 · Abyssal Hunter\'s Bond',
  'isharmla|skadi': '共存的躯壳 · Coexisting Vessels',
  'silverash|pramanix': '喀兰的守望 · Kjerag\'s Vigil',
  'blaze|logos': '精英之证 · Badge of Elites',
  'chongyue|ling': '岁家长兄妹 · Sui Siblings',
  'sui|ling': '岁家血脉 · Sui Bloodline',
  'emperorblade|collapsal': '国境线上的对峙 · Standoff at the Border',
  'warfarin|eyja': '血与火的研究 · Blood & Flame Research',
  'koschei|sui': '长生的博弈 · Immortality\'s Gambit',
};

/**
 * Get canon CP partner for an operator, or null if none in roster.
 */
export function getCPPartner(opId: string): string[] | null {
  return CANON_CP[opId] || null;
}

/**
 * Get CP tag label for a pair of operators.
 */
export function getCPTag(a: string, b: string): string | null {
  const key1 = `${a}|${b}`;
  const key2 = `${b}|${a}`;
  return CP_TAG[key1] || CP_TAG[key2] || null;
}
