import skillsMaster from '../data/syntheticSkillsMaster.json';
import ncoMaster from '../data/ncoOccupationsMaster.json';
import occSkillsMatrix from '../data/syntheticOccupationSkills.json';
import stateGapsData from '../data/stateSkillGaps.json';
import { SkillGraphNode, SkillGraphEdge } from '../types';

export const skillService = {
  async getAllSkills(query?: string, category?: string) {
    let list = skillsMaster as Array<{
      skill_id: string;
      skill_name: string;
      skill_category: string;
      skill_description: string;
    }>;

    if (category && category !== 'ALL') {
      list = list.filter(s => s.skill_category.toLowerCase() === category.toLowerCase());
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(s => 
        s.skill_name.toLowerCase().includes(q) || 
        s.skill_description.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getCategories(): Promise<string[]> {
    const list = skillsMaster as any[];
    const set = new Set<string>();
    list.forEach(s => {
      if (s.skill_category) set.add(s.skill_category);
    });
    return Array.from(set).sort();
  },

  /**
   * Generates a traceable skill progression pathway based on NCO 2015 and Occupation-Skill Matrix
   */
  async getSkillGraph(skillName: string): Promise<{
    nodes: SkillGraphNode[];
    edges: SkillGraphEdge[];
    targetOccupation: { ncoCode: string; title: string; demandIndex: number };
  }> {
    const allSkills = skillsMaster as any[];
    const matrix = occSkillsMatrix as any[];
    const ncoList = ncoMaster as any[];
    const gaps = stateGapsData as any[];

    const base = allSkills.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase()) || allSkills[0];

    // Find occupation matrix entries linked to this skill
    const matchedMatrix = matrix.filter(m => 
      m.skill_id === base.skill_id || 
      (m.skill_name && m.skill_name.toLowerCase() === base.skill_name.toLowerCase())
    );

    // Pick top matching occupation from NCO master
    let targetNco = ncoList[0];
    if (matchedMatrix.length > 0) {
      const topMat = matchedMatrix[0];
      const found = ncoList.find(n => String(n.nco_code) === String(topMat.nco_code));
      if (found) targetNco = found;
    }

    // Find skill gap status from development dataset
    const matchedGap = gaps.find(g => g.skill.toLowerCase() === base.skill_name.toLowerCase());
    const demandIndex = matchedGap ? Math.round((matchedGap.demand_units / 5) * 10) / 10 : 64;

    const nodes: SkillGraphNode[] = [
      {
        id: 'node-1',
        name: base.skill_name,
        category: base.skill_category,
        nsqfLevel: 4,
        demandIndex,
        shortageStatus: matchedGap?.status || 'Balanced',
        type: 'CURRENT'
      },
      {
        id: 'node-2',
        name: `${base.skill_name} Qualification Pack`,
        category: base.skill_category,
        nsqfLevel: 4,
        demandIndex: Math.min(95, demandIndex + 12),
        shortageStatus: 'Shortage',
        type: 'RELATED'
      },
      {
        id: 'node-3',
        name: `Advanced ${base.skill_category} Bridge`,
        category: 'Cross-Disciplinary Competency',
        nsqfLevel: 5,
        demandIndex: Math.min(98, demandIndex + 22),
        shortageStatus: 'Shortage',
        type: 'BRIDGE'
      },
      {
        id: 'node-4',
        name: targetNco.occupation_title || 'Target Specialization',
        category: targetNco.division_title || 'High-Deficit Specialization',
        nsqfLevel: Number(targetNco.nsqf_level) || 6,
        demandIndex: Math.min(99, demandIndex + 30),
        shortageStatus: 'Critical',
        type: 'TARGET'
      }
    ];

    const edges: SkillGraphEdge[] = [
      {
        source: 'node-1',
        target: 'node-2',
        weight: 0.85,
        label: 'Competency Alignment (85%)'
      },
      {
        source: 'node-1',
        target: 'node-3',
        weight: 0.68,
        label: 'Bridge Pathway (4-6 weeks)'
      },
      {
        source: 'node-2',
        target: 'node-3',
        weight: 0.74,
        label: 'Curriculum Progression'
      },
      {
        source: 'node-3',
        target: 'node-4',
        weight: 0.82,
        label: 'NCO 2015 Target Goal'
      }
    ];

    return {
      nodes,
      edges,
      targetOccupation: {
        ncoCode: String(targetNco.nco_code || '3115.0100'),
        title: targetNco.occupation_title || 'Mechanical Engineering Technician',
        demandIndex: Math.min(99, demandIndex + 30)
      }
    };
  }
};
