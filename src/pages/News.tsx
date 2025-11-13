import { useState, useEffect } from 'react';
import EnhancedRSSFeed from '@/components/EnhancedRSSFeed';

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bass-dark via-bass-medium to-bass-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📰 EDM News Archive
          </h1>
          <p className="text-slate-400">
            Browse all stories from the last 48 hours
          </p>
        </div>

        {/* Full Feed - No Pagination Limit */}
        <EnhancedRSSFeed 
          showAllPages={true}  // New prop to show all items
        />
      </div>
    </div>
  );
};

export default NewsPage;