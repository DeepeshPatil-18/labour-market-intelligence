import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchModal } from '../common/SearchModal';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-govt-50 text-govt-900 font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <SearchModal />
    </div>
  );
};
