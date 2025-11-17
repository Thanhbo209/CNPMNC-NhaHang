import React from 'react';
import SidebarAdmin from './SidebarAdmin';
import NavbarAdmin from './NavbarAdmin';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <SidebarAdmin />


              {/* Nội dung chính */}
            <div className="flex flex-col flex-1">
                <NavbarAdmin />
                <main className="p-6 bg-[#E5E7EB] flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>

        
    );
};

export default AdminLayout;