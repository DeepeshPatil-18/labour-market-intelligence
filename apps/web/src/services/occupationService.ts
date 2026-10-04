import ncoOccupationsData from '../data/ncoOccupations.json';
import { NCOOccupationRecord } from '../types';

export const occupationService = {
  async getOccupations(query?: string, divisionCode?: string, limit = 50): Promise<NCOOccupationRecord[]> {
    let list = ncoOccupationsData as NCOOccupationRecord[];

    if (divisionCode && divisionCode !== 'ALL') {
      list = list.filter(o => o.divisionCode === divisionCode);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(o => 
        o.title.toLowerCase().includes(q) || 
        o.ncoCode.includes(q) || 
        o.description.toLowerCase().includes(q) ||
        o.groupTitle.toLowerCase().includes(q) ||
        (o.qpNosName && o.qpNosName.toLowerCase().includes(q))
      );
    }

    return list.slice(0, limit);
  },

  async getDivisions(): Promise<Array<{ code: string; title: string; count: number }>> {
    const list = ncoOccupationsData as NCOOccupationRecord[];
    const map = new Map<string, { code: string; title: string; count: number }>();

    list.forEach(o => {
      if (!o.divisionCode) return;
      const cur = map.get(o.divisionCode) || {
        code: o.divisionCode,
        title: o.divisionTitle || `Division ${o.divisionCode}`,
        count: 0
      };
      cur.count++;
      map.set(o.divisionCode, cur);
    });

    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  },

  async getOccupationByCode(code: string): Promise<NCOOccupationRecord | null> {
    const list = ncoOccupationsData as NCOOccupationRecord[];
    const found = list.find(o => o.ncoCode === code || o.ncoCode.startsWith(code));
    return found || null;
  }
};
