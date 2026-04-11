import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';

import PortfolioEduardo from './components/PortfolioEduardo.tsx';
import { initGA, trackPageView } from './utils/analytics';

const AnalyticsWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    // Initializing GA
    initGA('G-FXR7VBX91Q');
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname + location.search);
  }, [location]);

  return <PortfolioEduardo />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AnalyticsWrapper />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
