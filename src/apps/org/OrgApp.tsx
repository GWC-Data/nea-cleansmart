import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrgDashboard } from './pages/OrgDashboard';
import { OrgEventCreatePage } from './pages/OrgEventCreatePage';
import { NotFoundPage } from '../../pages/NotFoundPage';

export const OrgApp: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<OrgDashboard />} />
      <Route path="create-event" element={<OrgEventCreatePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

