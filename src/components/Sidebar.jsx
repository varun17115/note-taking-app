import React from 'react';
import '../index.css'
import logo from '../assets/icons/logo.png'
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Sidebar = () => {
   const navigate = useNavigate();

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   return <div className="rounded-3xl w-2/12 h-full border-2">
      <aside id="logo-sidebar" className="h-full flex flex-col">
         <div className="px-3 py-4">
            <a href="" className="flex items-center ps-2.5 mb-5">
               <img src={logo} className="w-12 h-12 me-3" alt="" />
               <span className="self-center text-xl font-semibold whitespace-nowrap">AI NOTES</span>
            </a>
            <ul className="space-y-2 border-t-2 border-gray-200 font-medium">
               <li>
                  <a href="#" className="flex items-center p-2 rounded-lg text-purple-700 hover:bg-purple-400 group">
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                     </svg>
                     <span className="ms-3">Home</span>
                  </a>
               </li>
               <li>
                  <a href="#" className="flex items-center p-2 rounded-lg text-purple-700 hover:bg-purple-400 group">
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                     </svg>
                     <span className="ms-3">Favorites</span>
                  </a>
               </li>
            </ul>
         </div>

         {/* Logout Button at bottom */}
         <div className="mt-auto p-3 border-t border-gray-200">
            <button
               onClick={handleLogout}
               className="flex w-full items-center p-2 rounded-2xl text-red-600 hover:bg-red-100 group"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9a.75.75 0 01-1.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
               </svg>
               <span className="ms-3">Logout</span>
            </button>
         </div>
      </aside>
   </div>;
};

export default Sidebar; 
