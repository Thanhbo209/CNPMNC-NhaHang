import React from 'react';
import SidebarChef from './SidebarChef';
import NavbarChef from './NavbarChef';
import { Outlet } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ChefLayout = () => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <SidebarChef />


              {/* Nội dung chính */}
            <div className="flex flex-col flex-1">
                <NavbarChef />
                <main className="p-6 bg-[#E5E7EB] flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>

        
    );
};

export default ChefLayout;