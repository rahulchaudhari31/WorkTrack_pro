import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar  from '../components/common/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
