import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrgDashboard } from './pages/OrgDashboard';
import { NotFoundPage } from '../../pages/NotFoundPage';

export const OrgApp: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<OrgDashboard />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

