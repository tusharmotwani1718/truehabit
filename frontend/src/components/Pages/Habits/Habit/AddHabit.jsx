import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../../Form/Input/Input'
import { Select } from 'antd'
import DatePickerWindow from '../../../../ant-design/DatePickerWindow.jsx'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { addHabit, setHabits } from '../../../../store/Slices/habitSlice.js'
import { useMessage, useModal } from '../../../../context/index.js'
import api from '../../../../helpers/refreshToken.js'




function AddHabit() {

    // const [displayHabits, setDisplayHabits] = useState([]);
    const dispatch = useDispatch();
    const { displayMessage } = useMessage();
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm()

    const catOptions = [
        { value: 'Personal', label: 'Personal' },
        { value: 'Fitness', label: 'Fitness' },
        { value: 'Academics', label: 'Academics' },
        { value: 'Relationship', label: 'Relationship' },
        { value: 'Spirituality', label: 'Spirituality' },
        { value: 'Career', label: 'Career' },
        { value: 'Growth', label: 'Growth' },
        { value: 'Others', label: 'Others' }
    ];



    const frequencyOptions = [
        { value: 1, label: 'Every Day' },
        { value: 2, label: 'Every Other Day' },
        { value: 3, label: 'Every 3 Days' },
        { value: 7, label: 'Weekly' },
        { value: 30, label: 'Monthly' }

    ]

    const [buttonLoading, setButtonLoading] = useState(false);



    const onSubmit = async (formData) => {
        try {
            setButtonLoading(true)
            const response = await api.post(
                `${import.meta.env.VITE_API_BASE_URL_HABITS}/addhabit`,
                formData, {
                headers: { "Content-Type": "application/json" },
            })

            reset();
            dispatch(addHabit(response.data.data)) // add habit to the store.
            // console.log(response.data.data);
            closeModal(); // close the modal
            displayMessage('success', response.data.message);

        } catch (error) {
            displayMessage('error', error?.response?.data?.message || "Failed to add habit");
            // console.log(error);
            reset();
        }
        finally {
            setButtonLoading(false);
        }
    }

    return (
        <div className="p-6 w-full flex flex-col">
            <div className="text-center mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                    Add a new Habit
                </h2>

            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="text"
                    label="Title"
                    placeholder="Enter Habit Title"
                    classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("habitName", {
                        required: true,
                        minLength: 3,
                        maxLength: 50
                    })}
                />
                {errors.habitName && (
                    <p className="mt-2 text-sm text-red-600">{errors.habitName.message}</p>
                )}
                <Input
                    type="text"
                    label="Description"
                    placeholder="Enter Habit Description"
                    classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("habitDesc", {
                        required: true,
                        minLength: 5
                    })}
                />
                {errors.habitDesc && (
                    <p className="mt-2 text-sm text-red-600">{errors.habitDesc.message}</p>
                )}

                <Controller
                    name="habitCategory"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            showSearch
                            placeholder="Select a Category"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={catOptions}
                            className='w-full'
                        />
                    )}
                />
                {errors.habitCategory && (
                    <p className="mt-2 text-sm text-red-600">{errors.habitCategory.message}</p>
                )}




                <Controller
                    name="frequency"
                    control={control}
                    rules={{ required: "Frequency is required" }}
                    render={({ field }) => (
                        <Select
                            {...field}
                            showSearch
                            placeholder="Select Frequency"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={frequencyOptions}
                            className='w-full relative top-5'
                        />
                    )}
                />
                {errors.frequency && (
                    <p className="mt-2 text-sm text-red-600">{errors.frequency.message}</p>
                )}


                {/* Date Pickers */}
                <div className='flex justify-between mt-7'>
                    <Controller
                        name="startDate"
                        control={control}
                        rules={{ required: "Start date is required" }}
                        render={({ field }) => (
                            <DatePickerWindow placeholder='Start Date' label='Select Start Date'
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="endDate"
                        control={control}
                        rules={{ required: "End date is required" }}
                        render={({ field }) => (
                            <DatePickerWindow placeholder='End Date' label='Select End Date'
                                {...field}
                            />
                        )}
                    />
                </div>





                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={buttonLoading} // Add this to disable during loading
                        className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium flex items-center justify-center ${buttonLoading ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                    >
                        {buttonLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Adding Habit...
                            </>
                        ) : (
                            'Add Habit'
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}

export default AddHabit
