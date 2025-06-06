import React, { useId } from 'react'

const Input = React.forwardRef(function Input({
    type = "text",
    label,
    classname,
    ...props
}, ref)  {

    const id = useId();

    return (
        <div>
            {
                label &&
                <label htmlFor={id}>
                    {label}
                </label>

            }

            <input id={id}
             type={type}
             className={`w-full px-3 py-1 mt-2 ${classname}`}
             ref={ref}
             {...props}
             />

        </div>
    )
})

export default Input
