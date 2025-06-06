import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './components'


const navItems = [
  {
    text: "Home",
    link: "/",
    id: 1
  },
  {
    text: "About",
    link: "/about",
    id: 2
  },
  {
    text: "Contact",
    link: "/contact",
    id: 3
  },
  {
    text: "Feedback",
    link: "/feedback",
    id: 4
  },

]


function Layout() {
  return (
    <>
      <Header navList={navItems} />
      <Outlet />
      
    </>
  )
}

export default Layout
