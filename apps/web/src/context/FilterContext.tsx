import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalFilterState } from '../../src/types';
import { geographyService } from '../services/geographyService';
import { mapDataService } from '../services/mapDataService';

interface FilterContextType {
  filters: GlobalFilterState;
  availableStates: string[];
  availableDistricts: string[];
  setGeography: (state: string, district: string) => void;
  setSector: (sector: string) => void;
  setTimeHorizon: (horizon: '3m' | '6m' | '12m') => void;
  setSeverity: (severity: string) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  userEmail: string;
}

// Read initial state from URL query parameters if present, else fallback to ALL India
const getInitialFilters = (): GlobalFilterState => {
  let initialGeography = { state: 'ALL', district: 'ALL' };

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlState = params.get('state');
    const urlDist = params.get('district');
    if (urlState) {
      const canonicalState = mapDataService.getCanonicalStateName(urlState);
      initialGeography = {
        state: canonicalState,
        district: urlDist || 'ALL'
      };
    }
  }

  return {
    state: initialGeography.state,
    district: initialGeography.district,
    sector: 'ALL',
    timeHorizon: '6m',
    severity: 'ALL',
    searchQuery: ''
  };
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilterState>(() => getInitialFilters());

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('kushal_lmi_auth') === 'true';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return sessionStorage.getItem('kushal_lmi_user') || 'officer.planning@msde.gov.in';
  });

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    geographyService.getStates().then(states => {
      setAvailableStates(states);
    });
  }, []);

  useEffect(() => {
    geographyService.getDistricts(filters.state).then(districts => {
      setAvailableDistricts(districts);
    });
  }, [filters.state]);

  // Sync state with URL search params
  const setGeography = (state: string, district: string) => {
    const canonicalState = state === 'ALL' ? 'ALL' : mapDataService.getCanonicalStateName(state);
    
    setFilters(prev => ({
      ...prev,
      state: canonicalState,
      district: district || 'ALL'
    }));

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (canonicalState === 'ALL') {
        url.searchParams.delete('state');
        url.searchParams.delete('district');
      } else {
        const stateCode = mapDataService.getStateCode(canonicalState);
        url.searchParams.set('state', stateCode);
        if (district && district !== 'ALL') {
          url.searchParams.set('district', district);
        } else {
          url.searchParams.delete('district');
        }
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const setSector = (sector: string) => {
    setFilters(prev => ({ ...prev, sector }));
  };

  const setTimeHorizon = (timeHorizon: '3m' | '6m' | '12m') => {
    setFilters(prev => ({ ...prev, timeHorizon }));
  };

  const setSeverity = (severity: string) => {
    setFilters(prev => ({ ...prev, severity }));
  };

  const setSearchQuery = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  const resetFilters = () => {
    setFilters({
      state: 'ALL',
      district: 'ALL',
      sector: 'ALL',
      timeHorizon: '6m',
      severity: 'ALL',
      searchQuery: ''
    });

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('state');
      url.searchParams.delete('district');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const login = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email || 'officer.planning@msde.gov.in');
    sessionStorage.setItem('kushal_lmi_auth', 'true');
    sessionStorage.setItem('kushal_lmi_user', email || 'officer.planning@msde.gov.in');
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kushal_lmi_auth');
    sessionStorage.removeItem('kushal_lmi_user');
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        availableStates,
        availableDistricts,
        setGeography,
        setSector,
        setTimeHorizon,
        setSeverity,
        setSearchQuery,
        resetFilters,
        isSearchOpen,
        setIsSearchOpen,
        isAuthenticated,
        login,
        logout,
        userEmail
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
