import React from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './components'
import {
  MdFeedback,
  MdHome,
  MdOutlineSettings,
  MdPeople,
  MdQuestionMark,
  MdFormatListBulleted,
  MdAccountCircle,
  MdCalendarToday,
  MdEmail,
  MdContactSupport
} from "react-icons/md";

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <MdHome size={22} /> },
  { name: 'Today\'s Habits', path: '/todayhabits', icon: <MdCalendarToday size={21} /> },
  { name: 'My Habits', path: '/habits', icon: <MdFormatListBulleted size={22} /> },
  { name: 'Group Tracking', path: '/grouptracking', icon: <MdPeople size={22} />, badge: 'New' },
  { name: 'Profile', path: '/profile', icon: <MdAccountCircle size={22} /> },
  { name: 'Contact', path: '/contact', icon: <MdContactSupport size={22} /> }
];



function LoggedinLayout() {
  return (
    <div className='flex gap-0'>
      <Sidebar items={menuItems} className="w-auto" />
      <Outlet />
    </div>
  )
}

export default LoggedinLayout
