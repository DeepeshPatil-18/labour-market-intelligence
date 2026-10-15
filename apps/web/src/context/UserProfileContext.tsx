/**
 * UserProfileContext — Role-Based Access Control
 *
 * ⚠️  PROTOTYPE / FRONTEND-ONLY NOTICE
 * This implements client-side jurisdiction restrictions for the SIH 2026
 * prototype. Because enforcement happens in the browser, a determined user
 * could bypass these restrictions by manipulating localStorage or React state.
 *
 * REAL DEPLOYMENT REQUIREMENT:
 * All role assignments and geographic scope enforcement MUST be validated on a
 * trusted backend (e.g. a government API gateway) using verified identity
 * tokens (e.g. SAML / OAuth2 issued by NIC). The frontend should treat these
 * values as hints for UX only — not as security boundaries.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Role Types ───────────────────────────────────────────────────────────────
export type UserRole =
  | 'DISTRICT_OFFICER'   // DSC / DSDM — single district
  | 'STATE_PLANNER'      // SSDM — single state, all districts within
  | 'NATIONAL_MSDE'      // Ministry — All India access
  | 'SSC';               // Sector Skill Council — sector-filtered, configurable geo

// ─── Jurisdiction Scope ───────────────────────────────────────────────────────
export interface JurisdictionScope {
  /**
   * 'ALL'       → unrestricted (National MSDE)
   * '<State>'   → restricted to that state (State Planner)
   * '<District>'→ restricted to that district within assignedState (District Officer)
   */
  assignedState: string | 'ALL';
  assignedDistrict: string | 'ALL';
  assignedSectors: string[] | 'ALL';   // 'ALL' = no sector restriction
  /** The scope string that is force-applied to FilterContext on login */
  defaultGeoState: string;             // e.g. 'Maharashtra' or 'ALL'
  defaultGeoDistrict: string;          // e.g. 'Nashik' or 'ALL'
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  jurisdiction: JurisdictionScope;
  /** Ministry / organisation full name */
  organisation: string;
  /** Whether this is a demo/prototype account */
  isDemo: boolean;
}

// ─── Demo Accounts ────────────────────────────────────────────────────────────
/**
 * These are clearly-labelled PROTOTYPE demo accounts.
 * In production these must be replaced by backend-verified sessions.
 */
export const DEMO_ACCOUNTS: Record<string, UserProfile> = {
  'district.nashik@dsdm.mh.gov.in': {
    userId: 'demo-district-nashik-001',
    displayName: 'Rajesh Kumar Patil',
    email: 'district.nashik@dsdm.mh.gov.in',
    role: 'DISTRICT_OFFICER',
    roleLabel: 'District Officer (DSDM)',
    organisation: 'District Skill Development Mission — Nashik, Maharashtra',
    jurisdiction: {
      assignedState: 'Maharashtra',
      assignedDistrict: 'Nashik',
      assignedSectors: 'ALL',
      defaultGeoState: 'Maharashtra',
      defaultGeoDistrict: 'Nashik',
    },
    isDemo: true,
  },

  'planner.maharashtra@ssdm.mh.gov.in': {
    userId: 'demo-state-mh-001',
    displayName: 'Priya Anand Sharma',
    email: 'planner.maharashtra@ssdm.mh.gov.in',
    role: 'STATE_PLANNER',
    roleLabel: 'State Planner / Auditor (SSDM)',
    organisation: 'State Skill Development Mission — Maharashtra',
    jurisdiction: {
      assignedState: 'Maharashtra',
      assignedDistrict: 'ALL',
      assignedSectors: 'ALL',
      defaultGeoState: 'Maharashtra',
      defaultGeoDistrict: 'ALL',
    },
    isDemo: true,
  },

  'officer.planning@msde.gov.in': {
    userId: 'demo-national-msde-001',
    displayName: 'National Policy Officer',
    email: 'officer.planning@msde.gov.in',
    role: 'NATIONAL_MSDE',
    roleLabel: 'National MSDE Officer',
    organisation: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    jurisdiction: {
      assignedState: 'ALL',
      assignedDistrict: 'ALL',
      assignedSectors: 'ALL',
      defaultGeoState: 'ALL',
      defaultGeoDistrict: 'ALL',
    },
    isDemo: true,
  },

  'ssc.automotive@nsdc.gov.in': {
    userId: 'demo-ssc-auto-001',
    displayName: 'Automotive SSC Analyst',
    email: 'ssc.automotive@nsdc.gov.in',
    role: 'SSC',
    roleLabel: 'Sector Skill Council (Automotive)',
    organisation: 'Automotive Skills Development Council (ASDC) — NSDC',
    jurisdiction: {
      assignedState: 'ALL',
      assignedDistrict: 'ALL',
      assignedSectors: ['Automotive & Advanced Manufacturing', 'Electronics & Electrical Hardware'],
      defaultGeoState: 'ALL',
      defaultGeoDistrict: 'ALL',
    },
    isDemo: true,
  },
};

// ─── Capability Helpers ───────────────────────────────────────────────────────

/** Returns true if the user can view the given state */
export function canAccessState(profile: UserProfile | null, state: string): boolean {
  if (!profile) return false;
  if (profile.jurisdiction.assignedState === 'ALL') return true;
  if (state === 'ALL') {
    // 'ALL India' view only allowed for NATIONAL_MSDE / SSC
    return profile.role === 'NATIONAL_MSDE' || profile.role === 'SSC';
  }
  return state.toLowerCase() === profile.jurisdiction.assignedState.toLowerCase();
}

/** Returns true if the user can view the given district */
export function canAccessDistrict(profile: UserProfile | null, district: string): boolean {
  if (!profile) return false;
  if (district === 'ALL') {
    // District-level users cannot expand to "all districts"
    return profile.jurisdiction.assignedDistrict === 'ALL';
  }
  if (profile.jurisdiction.assignedDistrict === 'ALL') return true;
  return district.toLowerCase() === profile.jurisdiction.assignedDistrict.toLowerCase();
}

/** Returns true if the user can compare multiple states */
export function canCompareStates(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.role === 'NATIONAL_MSDE' || profile.role === 'SSC';
}

/** Returns true if user can switch geographic scope freely */
export function canChangeGeography(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.role === 'NATIONAL_MSDE' || profile.role === 'SSC';
}

/** Returns true if user's scope includes national/all-India */
export function hasNationalAccess(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.jurisdiction.assignedState === 'ALL';
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface UserProfileContextType {
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loginWithProfile: (email: string, password: string) => { success: boolean; error?: string };
  logoutProfile: () => void;
  canAccessState: (state: string) => boolean;
  canAccessDistrict: (district: string) => boolean;
  canCompareStates: () => boolean;
  canChangeGeography: () => boolean;
  hasNationalAccess: () => boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const SESSION_KEY = 'kushal_lmi_user_profile';

// ─── Provider ─────────────────────────────────────────────────────────────────
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved) as UserProfile;
    } catch { /* ignore */ }
    return null;
  });

  const isAuthenticated = userProfile !== null;

  const loginWithProfile = (email: string, _password: string): { success: boolean; error?: string } => {
    const profile = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (!profile) {
      return { success: false, error: 'UNKNOWN_ACCOUNT' };
    }
    setUserProfile(profile);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    } catch { /* ignore */ }
    return { success: true };
  };

  const logoutProfile = () => {
    setUserProfile(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const contextValue: UserProfileContextType = {
    userProfile,
    isAuthenticated,
    loginWithProfile,
    logoutProfile,
    canAccessState: (state: string) => canAccessState(userProfile, state),
    canAccessDistrict: (district: string) => canAccessDistrict(userProfile, district),
    canCompareStates: () => canCompareStates(userProfile),
    canChangeGeography: () => canChangeGeography(userProfile),
    hasNationalAccess: () => hasNationalAccess(userProfile),
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
