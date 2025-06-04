
import { useState } from 'react';

export type TabType = 'overview' | 'media' | 'guests' | 'qr' | 'ai' | 'settings';

export const useTabNavigation = (defaultTab: TabType = 'overview') => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const isTabActive = (tab: TabType) => activeTab === tab;

  return {
    activeTab,
    setActiveTab,
    isTabActive
  };
};
