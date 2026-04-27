import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OrgDashboard } from './pages/OrgDashboard';

export const OrgApp: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<OrgDashboard />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
