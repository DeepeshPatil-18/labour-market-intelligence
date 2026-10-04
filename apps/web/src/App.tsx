import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { Layout } from './components/layout/Layout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { SignInPage } from './pages/public/SignInPage';
import { SkillFinderPage } from './pages/public/SkillFinderPage';
import { MyRoadmapPage } from './pages/public/MyRoadmapPage';

// Government Dashboard Pages
import { OverviewPage } from './pages/government/OverviewPage';
import { LabourMarketPage } from './pages/government/LabourMarketPage';
import { ForecastPage } from './pages/government/ForecastPage';
import { EarlyWarningsPage } from './pages/government/EarlyWarningsPage';
import { SkillTransitionsPage } from './pages/government/SkillTransitionsPage';
import { TrainingAllocationPage } from './pages/government/TrainingAllocationPage';

export const App: React.FC = () => {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Government Sign In */}
          <Route path="/sign-in" element={<SignInPage />} />

          {/* Authenticated Dashboard Shell */}
          <Route element={<Layout />}>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/labour-market" element={<LabourMarketPage />} />
            <Route path="/forecasts" element={<ForecastPage />} />
            <Route path="/early-warnings" element={<EarlyWarningsPage />} />
            <Route path="/skill-transitions" element={<SkillTransitionsPage />} />
            <Route path="/training-allocation" element={<TrainingAllocationPage />} />
            
            {/* Public Tools in Navigation */}
            <Route path="/skill-finder" element={<SkillFinderPage />} />
            <Route path="/my-roadmap" element={<MyRoadmapPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  );
};

export default App;
