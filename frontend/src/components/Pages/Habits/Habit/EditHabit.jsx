import React, { useEffect, useState } from 'react'
import { Controller, set, useForm, useWatch } from 'react-hook-form'
import Input from '../../../Form/Input/Input.jsx'
import { Select } from 'antd'
import DatePickerWindow from '../../../../ant-design/DatePickerWindow.jsx'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { updateHabit as updateHabitSlice } from '../../../../store/Slices/habitSlice.js'
import { useMessage } from '../../../../context/index.js'
import Spinner from '../../../utils/Spinner.jsx'
import dayjs from 'dayjs'




function EditHabit({
    habitId
}) {

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
    const [habit, setHabit] = useState({});
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const { displayMessage } = useMessage();
    const dispatch = useDispatch();


    // react-hook-form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        control
    } = useForm({
        defaultValues: {
            habitName: "",
            habitDesc: "",
            habitCategory: "",
            startDate: "",
            endDate: ""

        }
    });




    useEffect(() => {
        const fetchHabit = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL_HABITS}/fetchhabitdetails/${habitId}`, {
                    withCredentials: true,
                    // params: { habitId }
                });
                const fetchedHabit = response.data.data.habit;
                // console.log(fetchedHabit);
                setHabit(fetchedHabit); // ✅ still store it

                // ✅ use response directly to reset form
                if (fetchedHabit?.habitName) {
                    reset({
                        habitName: fetchedHabit.habitName,
                        habitDesc: fetchedHabit.habitDesc,
                        habitCategory: fetchedHabit.habitCategory,
                        // dayjs is used to initialise ant-d calendars with default dates
                        startDate: dayjs(fetchedHabit.startDate),
                        endDate: dayjs(fetchedHabit.endDate)
                    });
                }

            } catch (error) {
                setHabit({});
                displayMessage("error", "Network Error");
                console.error('Error fetching habit:', error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchHabit();
    }, [habitId, reset]);


    // use to disable the update button, if no field is changed
    const watchedFields = useWatch({ control });
    const [formChanged, setFormChanged] = useState(false);
    useEffect(() => {
        const checkIfChanged = () => {
            if (!habit || !watchedFields) return false;

            const { habitName, habitDesc, habitCategory, startDate, endDate } = watchedFields;

            return (
                habitName !== habit.habitName ||
                habitDesc !== habit.habitDesc ||
                habitCategory !== habit.habitCategory ||
                !dayjs(startDate).isSame(dayjs(habit.startDate), 'day') ||
                !dayjs(endDate).isSame(dayjs(habit.endDate), 'day')
            );
        };

        setFormChanged(checkIfChanged());
    }, [watchedFields, habit]);



    // send the data to the backend API only when the value is changed
    const buildFinalData = (formData, originalData) => {
        const finalData = {};

        if (formData.habitName !== originalData.habitName) {
            finalData.hName = formData.habitName;
        }
        if (formData.habitDesc !== originalData.habitDesc) {
            finalData.hDesc = formData.habitDesc;
        }

        if (formData.habitCategory !== originalData.habitCategory) {
            finalData.category = formData.habitCategory;
        }

        if (!dayjs(formData.startDate).isSame(dayjs(originalData.startDate), 'day')) {
            // finalData.startDate = formData.startDate;
            finalData.startDate = dayjs(formData.startDate).toDate();
        }

        if (!dayjs(formData.endDate).isSame(dayjs(originalData.endDate), 'day')) {
            // finalData.endDate = formData.endDate;
            finalData.endDate = dayjs(formData.endDate).toDate();
        }

        return finalData;
    };


    const sendData = async (finalData) => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL_HABITS}/updatehabit`, { habitId, ...finalData }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            displayMessage("success", response.data.message);
            // console.log(response.data.data);
            // update the store:
            dispatch(updateHabitSlice(response.data.data));
        } catch (error) {
            displayMessage("error", "Network Error");
            console.log(error);
        }
    };



    const onSubmit = async (data) => {
        setButtonLoading(true);
        const finalData = buildFinalData(data, habit);
        if (finalData) {
            await sendData(finalData);
        }
        setButtonLoading(false);
    };

    if (loading) {
        return <Spinner />
    }

    return (
        <div className="p-6 w-full flex flex-col">
            <div className="text-center mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                    Edit Habit
                </h2>

            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="text"
                    label="Title"
                    placeholder="Enter new Title"
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
                    placeholder="Enter new Description"
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
                            placeholder="Update Category"
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
                        disabled={buttonLoading || !formChanged} // Add this to disable during loading
                        className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium flex items-center justify-center ${buttonLoading || !formChanged ? 'opacity-80 cursor-not-allowed' : ''
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
                                Update Habit...
                            </>
                        ) : (
                            'Update Habit'
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}

export default EditHabit
