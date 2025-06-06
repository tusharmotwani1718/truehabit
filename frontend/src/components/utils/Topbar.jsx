import React from 'react'

function Topbar({
    text = "Home",
    className
}) {
  return (
    <div
     className={`w-full mt-3 text-primary dark:text-dark-primary font-bold text-lg px-6 ${className}`}
     >
      {text}
    </div>
  )
}

export default Topbar
