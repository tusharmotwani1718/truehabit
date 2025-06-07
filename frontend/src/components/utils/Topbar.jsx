import React from 'react'

function Topbar({
  text = "Home",
  className
}) {
  return (
    <div className={`w-full mt-3 sm:mt-4 text-primary dark:text-dark-primary font-bold text-lg sm:text-xl px-2 sm:px-6 ${className}`}>
      {text}
    </div>
  )
}

export default Topbar
