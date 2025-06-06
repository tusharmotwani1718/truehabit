import React, { useEffect, useState } from 'react'
import { Card, Tabs, Topbar, TopOptions, Habit, Spinner } from '../../index'
import { MdAdd, MdFilterListAlt, MdOutlinePlaylistRemove } from 'react-icons/md'
import { SearchBar } from '../../index.js'
import { useMessage, useModal } from '../../../context/index.js'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHabits } from '../../../store/Slices/habitSlice.js'
import axios from 'axios'
import { useNavigate } from 'react-router'










function Habits() {
    const { displayMessage } = useMessage();
    const [habitType, setHabitType] = useState('active');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeHabits, setActiveHabits] = useState(0);
    const [expiredHabits, setExpiredHabits] = useState(0);


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
        { optionName: "Add Habits", optionIcon: <MdAdd size={23} />, button: true, onClick: () => openModal("addHabitModal") },
        { optionIcon: <MdFilterListAlt size={23} /> },
        { optionIcon: <SearchBar /> }
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
            currentHabits.map((habit, index) => (

                <Habit habitId={habit._id} key={index} title={habit.habitName} description={habit.habitDesc} category={habit.habitCategory} frequency={habit.frequency} notesNumber={habit.notes} status={habit.status} startDate={habit.startDate} endDate={habit.endDate} showCheckMark={false}
                    className='transition duration-200 ease-in-out hover:bg-primary/20 hover:dark:bg-dark-primary/20 hover:text-white hover:shadow-lg cursor-pointer'
                    onClick={() => navigate(`/viewhabit/${habit._id}`)}
                />
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <MdOutlinePlaylistRemove className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    No Habits to Display
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            <main className='md:w-[90%] mx-auto'>
                <Topbar text="Habits" />

                <section className='mt-6 flex flex-col md:gap-8'>
                    <TopOptions options={topOpions} />
                    <div className='flex md:justify-between md:w-[90%] mx-auto'>
                        <Card title='Total Habits' content={activeHabits + expiredHabits} />
                        <Card title='Active Habits' content={activeHabits} />
                        <Card title='Previous Habits' content={expiredHabits} />
                    </div>
                    <div className='md:w-[90%] mx-auto md:h-[55vh] overflow-y-auto'>
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