// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { ClipboardCheck, Clock, LogOut, Mail, Phone } from 'lucide-react';
// import { logout } from '../../store/authSlice';

// export default function PendingApproval() {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
  
//   // Ensure users can't access this page unless logged in as a doctor
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/doctor-login');
//     } else if (user && user.doctor_profile && user.doctor_profile.is_approved) {
//       // If user is already approved, redirect to dashboard
//       navigate('/doctor/dashboard');
//     }
//   }, [isAuthenticated, user, navigate]);
  
//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/doctor-login');
//   };
  
//   // If we don't have user data yet, show a simple loading state
//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex justify-center items-center">
//         <div className="text-gray-600">Loading...</div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
//       <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
//         <div className="flex justify-center mb-6">
//           <div className="bg-yellow-100 p-4 rounded-full">
//             <Clock size={48} className="text-yellow-600" />
//           </div>
//         </div>
        
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Account is Pending Approval</h1>
        
//         <p className="text-gray-600 mb-6">
//           Thank you for registering with DOCNET, Dr. {user?.username}. 
//           Our administrative team is reviewing your credentials.
//         </p>
        
//         <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
//           <div className="flex">
//             <ClipboardCheck className="text-blue-500 mr-2 flex-shrink-0" size={20} />
//             <p className="text-blue-700 text-sm">
//               This process usually takes 1-3  days. You'll be redirected to your dashboard once your account has been approved.
//             </p>
//           </div>
//         </div>
        
//         <div className="border-t border-gray-200 pt-6 mt-6">
//           <h2 className="font-semibold text-gray-700 mb-2">Your Registration Details</h2>
          
//           <div className="text-left text-sm text-gray-600 mb-6">
//             <div className="grid grid-cols-2 gap-2 mb-1">
//               <div className="font-medium">Registration ID:</div>
//               <div>{user?.doctor_profile?.registration_id}</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mb-1">
//               <div className="font-medium">Email:</div>
//               <div>{user?.email}</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mb-1">
//               <div className="font-medium">Phone:</div>
//               <div>{user?.phone}</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mb-1">
//               <div className="font-medium">Experience:</div>
//               <div>{user?.doctor_profile?.experience} years</div>
//             </div>
//             {user?.doctor_profile?.hospital && (
//               <div className="grid grid-cols-2 gap-2 mb-1">
//                 <div className="font-medium">Hospital:</div>
//                 <div>{user?.doctor_profile?.hospital}</div>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <button
//           onClick={handleLogout}
//           className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
//         >
//           <LogOut size={16} className="mr-2" />
//           Sign Out
//         </button>
//       </div>
      
//       <div className="mt-6 text-gray-500 text-sm">
//         <p className="mb-2">For any questions, please contact our support team:</p>
//         <div className="flex justify-center space-x-4">
//           <div className="flex items-center">
//             <Mail size={14} className="mr-1 text-gray-400" />
//             <span>support@docnet.com</span>
//           </div>
//           <div className="flex items-center">
//             <Phone size={14} className="mr-1 text-gray-400" />
//             <span>1-800-DOCNET</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }