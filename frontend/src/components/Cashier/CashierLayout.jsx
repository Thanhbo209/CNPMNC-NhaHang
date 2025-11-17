import React from 'react';
import SidebarCashier from './SidebarCashier';
import NavbarCashier from './NavbarCashier';
import { Outlet } from 'react-router-dom';

const CashierLayout = () => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <SidebarCashier />


              {/* Nội dung chính */}
            <div className="flex flex-col flex-1">
                <NavbarCashier />
                <main className="p-6 bg-[#E5E7EB] flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>

        
    );
};

export default CashierLayout;