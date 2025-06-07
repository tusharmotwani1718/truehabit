import React from 'react'

function Card({
  title = "",
  content = "",
  featureLine,
  className
}) {
  return (
    <div className={`bg-gradient-to-br from-primary/10 to-primary/5 dark:from-dark-primary/20 dark:to-dark-primary/10 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm transition-all ${className}`}>
      <h2 className='text-xs sm:text-sm font-semibold text-primary dark:text-dark-primary mb-1 sm:mb-2 uppercase tracking-wide'>
        {title}
      </h2>
      <div className='flex items-baseline gap-2 sm:gap-3'>
        <span className='font-bold text-2xl sm:text-3xl text-primary dark:text-dark-primary'>
          {content}
        </span>
        {featureLine &&
          <span className='text-xs sm:text-sm text-primary/80 dark:text-dark-primary/70'>
            {featureLine}
          </span>
        }
      </div>
    </div>
  )
}

export default Card