import React from 'react'

function Card({
    title = "",
    content = "",
    featureLine,
    className
}) {
    return (
        <div className={`bg-gradient-to-br from-primary/10 to-primary/5 dark:from-dark-primary/20 dark:to-dark-primary/10 p-6 rounded-2xl shadow-sm transition-all ${className}`}>
            <h2 className='text-sm font-semibold text-primary dark:text-dark-primary mb-2 uppercase tracking-wide'>
                {title}
            </h2>
            <div className='flex items-baseline gap-3'>
                <span className='font-bold text-3xl text-primary dark:text-dark-primary'>
                    {content}
                </span>
                {featureLine &&
                    <span className='text-sm text-primary/80 dark:text-dark-primary/70'>
                        {featureLine}
                    </span>
                }
            </div>
        </div>
    )
}

export default Card