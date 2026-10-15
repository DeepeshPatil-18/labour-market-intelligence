/**
 * JurisdictionGuard
 *
 * Wraps any content that requires a specific geographic or role scope.
 * When the user's profile does not satisfy the required scope, the children
 * are replaced by a clear, localised restriction notice — preventing any data
 * leakage through alternate navigation paths.
 *
 * Usage:
 *   <JurisdictionGuard requiredState="Gujarat">
 *     <SomeContent />
 *   </JurisdictionGuard>
 */

import React from 'react';
import { Lock, MapPin, Warning } from '@phosphor-icons/react';
import { useUserProfile } from '../../context/UserProfileContext';
import { useLanguage } from '../../context/LanguageContext';

interface JurisdictionGuardProps {
  children: React.ReactNode;
  /** If set, user must be able to access this state */
  requiredState?: string;
  /** If set, user must be able to access this district */
  requiredDistrict?: string;
  /** If true, user must have national/all-India access */
  requiresNational?: boolean;
  /** If true, user must be able to compare states */
  requiresStateComparison?: boolean;
  /** Override the block message */
  blockMessage?: string;
  /** Show compact inline message instead of full block */
  inline?: boolean;
}

const STRINGS = {
  EN: {
    restricted: 'Access Restricted',
    outOfJurisdiction: 'This data is outside your assigned jurisdiction.',
    yourScope: 'Your assigned scope:',
    contactAdmin: 'Contact your ministry or department administrator to request expanded access.',
    prototype: 'Prototype: Frontend-only restriction. Production requires backend enforcement.',
  },
  HI: {
    restricted: 'पहुँच प्रतिबंधित',
    outOfJurisdiction: 'यह डेटा आपके निर्धारित क्षेत्राधिकार के बाहर है।',
    yourScope: 'आपका निर्धारित कार्यक्षेत्र:',
    contactAdmin: 'विस्तारित पहुँच के लिए अपने मंत्रालय या विभाग के प्रशासक से संपर्क करें।',
    prototype: 'प्रोटोटाइप: केवल फ्रंटएंड प्रतिबंध। उत्पादन में बैकएंड लागू होना आवश्यक है।',
  },
};

export const JurisdictionGuard: React.FC<JurisdictionGuardProps> = ({
  children,
  requiredState,
  requiredDistrict,
  requiresNational = false,
  requiresStateComparison = false,
  blockMessage,
  inline = false,
}) => {
  const { userProfile, canAccessState, canAccessDistrict, hasNationalAccess, canCompareStates } = useUserProfile();
  const { lang } = useLanguage();
  const s = STRINGS[lang];

  // Determine if access is denied
  let isDenied = false;

  if (!userProfile) {
    isDenied = true;
  } else if (requiresNational && !hasNationalAccess()) {
    isDenied = true;
  } else if (requiresStateComparison && !canCompareStates()) {
    isDenied = true;
  } else if (requiredState && requiredState !== 'ALL' && !canAccessState(requiredState)) {
    isDenied = true;
  } else if (requiredDistrict && requiredDistrict !== 'ALL' && !canAccessDistrict(requiredDistrict)) {
    isDenied = true;
  }

  if (!isDenied) {
    return <>{children}</>;
  }

  const scopeString = userProfile
    ? userProfile.jurisdiction.assignedDistrict !== 'ALL'
      ? `${userProfile.jurisdiction.assignedDistrict}, ${userProfile.jurisdiction.assignedState}`
      : userProfile.jurisdiction.assignedState !== 'ALL'
      ? userProfile.jurisdiction.assignedState
      : 'All India'
    : '—';

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        <Lock size={13} className="shrink-0" />
        <span>{blockMessage || s.outOfJurisdiction}</span>
        <span className="ml-1 font-semibold">{scopeString}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white border border-govt-200 rounded-card space-y-4">
      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
        <Lock size={22} className="text-amber-700" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-govt-900 mb-1">{s.restricted}</h3>
        <p className="text-xs text-govt-600 max-w-sm">{blockMessage || s.outOfJurisdiction}</p>
      </div>

      <div className="flex items-center gap-2 text-xs bg-govt-50 border border-govt-200 rounded px-3 py-2">
        <MapPin size={13} className="text-govt-500 shrink-0" />
        <span className="text-govt-500">{s.yourScope}</span>
        <span className="font-semibold text-navy-900">{scopeString}</span>
      </div>

      <p className="text-xs text-govt-500 max-w-xs">{s.contactAdmin}</p>

      <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
        <Warning size={11} className="shrink-0" />
        <span>{s.prototype}</span>
      </div>
    </div>
  );
};
