import React, { useEffect, useState } from 'react'
import { Card, Tabs, Topbar, TopOptions, Habit, Spinner } from '../../index'
import { MdAdd, MdFilterListAlt, MdOutlinePlaylistRemove } from 'react-icons/md'
import { SearchBar } from '../../index.js'
import { useMessage, useModal } from '../../../context/index.js'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHabits } from '../../../store/Slices/habitSlice.js'
import axios from 'axios'
import { useNavigate } from 'react-router'
import { Alert } from 'antd'






function Habits() {
    const { displayMessage } = useMessage();
    const [habitType, setHabitType] = useState('active');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [activeHabits, setActiveHabits] = useState(0);
    const [expiredHabits, setExpiredHabits] = useState(0);
    const isEmailVerified = useSelector((state) => state.auth.userData?.isEmailVerified);

    // redirect user if not logged in:
    useEffect(() => {
        if (!userData) {
            navigate('/');
            displayMessage('error', 'Please Login First');
        }
    }, []);

    // modal context:
    const { openModal } = useModal();

    // Get data from Redux store
    const { currentHabits, loading, error } = useSelector((state) => state.habit);

    const habitCount = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL_HABITS}/count`,
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            const habitCountTypes = response.data.data;
            habitCountTypes.map((habitCountType) => {
                if (habitCountType._id === "active") {
                    setActiveHabits(habitCountType.count);
                } else if (habitCountType._id === "expired") {
                    setExpiredHabits(habitCountType.count);
                }
                else {
                    return;
                }
            })
            // console.log(response.data.data)
            // return response.data.data || []; // Resolved payload

        } catch (error) {
            console.log(error);
            displayMessage("error", "Network Error");
            setActiveHabits(0);
            setExpiredHabits(0);
            return error.response?.data || 'Failed to fetch habits';
        }
    }

    useEffect(() => {
        dispatch(fetchHabits(habitType));
        habitCount();

    }, [habitType, dispatch, currentHabits.length]);


    if (error) return;

    const topOpions = [
        { optionName: "Add Habits", optionIcon: <MdAdd size={23} />, button: true, disabled: !isEmailVerified, onClick: () => openModal("addHabitModal") }
    ];

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64 w-full">
                    <Spinner size="lg" />
                </div>
            );
        }




        return currentHabits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                {currentHabits.map((habit, index) => (
                    <Habit
                        habitId={habit._id}
                        key={index}
                        title={habit.habitName}
                        description={habit.habitDesc}
                        category={habit.habitCategory}
                        frequency={habit.frequency}
                        notesNumber={habit.notes}
                        status={habit.status}
                        startDate={habit.startDate}
                        endDate={habit.endDate}
                        showCheckMark={false}
                        className='transition duration-200 ease-in-out hover:bg-primary/20 hover:dark:bg-dark-primary/20 hover:text-white hover:shadow-lg cursor-pointer'
                        onClick={() => navigate(`/viewhabit/${habit._id}`)}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                <MdOutlinePlaylistRemove className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600 mb-2 sm:mb-3" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-300">
                    No Habits to Display
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your habits will appear here.
                </p>
            </div>
        );
    };

    const tabOptions = [
        {
            label: "Active",
            content: renderTabContent()
        },
        {
            label: "Previous",
            content: renderTabContent()
        }
    ];

    const handleTabChange = (index) => {
        setHabitType(index === 0 ? 'active' : 'expired');
    };

    return (
        <>
            <main className='w-full md:w-[90%] mx-auto px-4 sm:px-6 overflow-x-hidden md:max-w-[90%]'>
                <Topbar text="Habits" />

                <section className='mt-4 sm:mt-6 flex flex-col gap-4 sm:gap-6 md:gap-8'>
                    {
                        !isEmailVerified && (
                            <Alert 
                                type="warning"
                                message="Please verify your email in the profile page to add habits."
                                className="w-full mx-auto"
                                closable
                                showIcon
                            />
                        )
                    }
                    <TopOptions options={topOpions} />

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full md:w-[90%] mx-auto'>
                        <Card title='Total Habits' content={activeHabits + expiredHabits} />
                        <Card title='Active Habits' content={activeHabits} />
                        <Card title='Previous Habits' content={expiredHabits} />
                    </div>

                    <div className='w-full md:w-[90%] mx-auto h-[55vh] sm:h-[60vh] overflow-y-auto'>
                        <Tabs
                            tabs={tabOptions}
                            onTabsChange={handleTabChange}
                        />
                    </div>
                </section>
            </main>
        </>
    );
}

export default Habits;