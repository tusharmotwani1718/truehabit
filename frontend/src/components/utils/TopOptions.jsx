import React from 'react'



function TopOptions({
    options = [],
    className = ""
}) {




    return (
        <>
            <div
                className={`w-[95%] flex items-center justify-end my-8 md:gap-5 ${className}`}
            >
                {
                    options &&
                    options.map((option, index) => (
                        <span className='flex gap-2 items-center text-primary dark:text-dark-primary'
                            key={index}
                        >
                            {option.optionIcon && option.optionIcon}
                            {option.button ? 
                            option.optionName && <button
                            onClick={option.onClick}
                            >
                                <span className='font-semibold'>{option.optionName}</span>
                            </button>
                            :
                            option.optionName && <span className='font-semibold'>{option.optionName}</span>
                            }
                            {}
                        </span>
                    ))
                }

            </div>
        </>
    )
}

export default TopOptions
