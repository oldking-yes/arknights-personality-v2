/**
 * Canon CP pairings within the 16-operator roster.
 * If user matches one member, the canon partner is shown as CP instead of algorithm match.
 * Based on Arknights community consensus (Bilibili, NGA, Lofter).
 */
export const CANON_CP: Record<string, string> = {
  texas: 'lappland',
  lappland: 'texas',
  chen: 'hoshiguma',
  hoshiguma: 'chen',
  exusiai: 'mostima',
  mostima: 'exusiai',
  saria: 'ifrit',
  ifrit: 'saria',
};

/** CP display names for UI */
export const CP_TAG: Record<string, string> = {
  'texas|lappland': '双狼 · Twin Wolves',
  'chen|hoshiguma': '龙门搭档 · Lungmen Partners',
  'exusiai|mostima': '红蓝天使 · Crimson & Azure',
  'saria|ifrit': '莱茵羁绊 · Rhine Bond',
};

/**
 * Get canon CP partner for an operator, or null if none in roster.
 */
export function getCPPartner(opId: string): string | null {
  return CANON_CP[opId] || null;
}
