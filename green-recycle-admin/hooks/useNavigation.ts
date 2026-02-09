import { useState } from 'react';
import type { TabView } from '../types';

export const useNavigation = (initialTab: TabView = 'dashboard') => {
  const [activeTab, setActiveTab] = useState<TabView>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  const resetNavigation = () => {
    setActiveTab(initialTab);
    closeMobileMenu();
  };

  return {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    resetNavigation
  };
};