import React from 'react';
import SidebarWaiter from './SidebarWaiter';
import NavbarWaiter from './NavbarWaiter';
import { Outlet } from 'react-router-dom';

const WaiterLayout = () => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <SidebarWaiter />


              {/* Nội dung chính */}
            <div className="flex flex-col flex-1">
                <NavbarWaiter />
                <main className="p-6 bg-[#E5E7EB] flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>

        
    );
};

export default WaiterLayout;