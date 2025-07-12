import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import BottomNavigation from '@/components/BottomNavigation';
import { SimpleDJStation } from '@/components/SimpleDJStation';

const DJMixStation = () => {
  return (
    <ProtectedRoute>
      <SimpleDJStation />
      <BottomNavigation />
    </ProtectedRoute>
  );
};

export default DJMixStation;
