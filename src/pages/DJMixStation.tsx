import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
// import { SimpleDJStation } from '@/components/SimpleDJStation';

const DJMixStation = () => {
  return (
    <>
      {/* <SimpleDJStation /> */}
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold text-center">DJ Mix Station</h1>
        <p className="text-center mt-4">DJ Station temporarily disabled for maintenance</p>
      </div>
      <BottomNavigation />
    </>
  );
};

export default DJMixStation;
