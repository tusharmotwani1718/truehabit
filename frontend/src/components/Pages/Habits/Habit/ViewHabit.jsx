import React, { useEffect, useState } from 'react'
import { Card, ConfirmDialog, Input, PrimaryButton, Spinner, Topbar } from '../../../index.js'
import { FaCalendarAlt, FaCheckCircle, FaPlus, FaTrophy, FaFire } from 'react-icons/fa'
import { FaRepeat, FaNoteSticky, FaChartColumn } from 'react-icons/fa6'
import ProgressBar from '../../../utils/ProgressBar'
import { Calendar, ConfigProvider, Badge } from 'antd'
import dayjs from 'dayjs'
import axios from 'axios'
import { useLocation, useNavigate, useParams } from 'react-router'
import { formatDate, NormaliseText } from '../../../../../../shared/functions/index.js';
import { useMessage } from '../../../../context/index.js'
import { TiGroupOutline } from "react-icons/ti";
import { deleteHabit as deleteHabitSlice } from '../../../../store/Slices/habitSlice.js'
import { useDispatch } from 'react-redux'



function ViewHabit({
    isGroupHabit = false,
}) {
    const { habitId } = useParams();


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const groupId = queryParams.get('groupId'); // available only for group habits
    const userId = queryParams.get('userId'); // available only for group 

    if (groupId && userId) {
        isGroupHabit = true;
    }

    // console.log(groupId, userId);

    const [group, setGroup] = useState();
    const [habitData, setHabitData] = useState({});
    const [currStreak, setCurrStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [completedDays, setCompletedDays] = useState([]);
    const [completedDaysNum, setCompletedDaysNum] = useState(0);
    const [expectedDaysNum, setExpectedDaysNum] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { displayMessage } = useMessage();
    const dispatch = useDispatch();

    const frequencyMap = {
        1: "Daily",
        2: "Every Other Day",
        3: "Every 3 days",
        7: "Weekly",
        30: "Monthly"
    }

    let percentageCompletion = 0;





    const [calendarValue, setCalendarValue] = useState(dayjs());
    const [notes, setNotes] = useState([
        { id: 1, text: 'Completed the introduction section of Java basics today. The syntax is similar to C++ which makes it easier to grasp.', date: 'May 1' },
        { id: 2, text: 'Struggled with understanding OOP concepts but finally got a breakthrough with inheritance examples.', date: 'May 3' },
        { id: 3, text: 'Built my first mini Java application - a calculator with GUI using Swing. Excited to build more!', date: 'May 7' },
        { id: 4, text: 'Learning about Collections framework today. HashMaps and ArrayLists are incredibly useful.', date: 'May 9' },
    ]);
    const [newNote, setNewNote] = useState('');
     const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onChangeCalendar = (value) => {
        setCalendarValue(value);
    };

    // const handleAddNote = () => {
    //     if (newNote.trim()) {
    //         const today = dayjs().format('MMM D');
    //         setNotes([
    //             { id: notes.length + 1, text: newNote, date: today },
    //             ...notes
    //         ]);
    //         setNewNote('');
    //     }
    // };

    const deleteHabit = async (id) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL_HABITS}/deletehabit/${id}`,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                });

            displayMessage("success", response.data.message);
        } catch (error) {
            console.log(error);
            displayMessage("error", "Network Error")
        }
    }

    const handleConfirm = async (deleteId) => {
        try {
            setButtonLoading(true);
            await deleteHabit(deleteId);
            dispatch(deleteHabitSlice(deleteId));
            navigate('/habits');
            setIsDialogOpen(false); // Only close on success
        } catch (error) {
            console.error("Error deleting habit:", error);
            displayMessage("error", "Network Error");
        } finally {
            setButtonLoading(false);
        }
    };



    // Fixed date cell render with consistent height
    const dateCellRender = (value) => {
        const dateString = value.format('YYYY-MM-DD');
    
        const isCompleted = completedDays.some(day =>
            day.startsWith(dateString)
        );

        return (
            <div className="h-8 w-full flex items-center justify-center">
                {isCompleted && (
                    <FaCheckCircle className="text-primary dark:text-dark-primary text-sm" />
                )}
            </div>
        );
    };



    const fetchHabitDetailsforIndividual = async () => {
        try {

            let response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL_HABITS}/fetchhabitdetails/${habitId}`,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                }
            );




            const result = response.data.data;
            const habit = response.data.data.habit;
            setHabitData(habit);
            setCompletedDays(habit.completedDays);
            setCurrStreak(result.currStreak);
            setBestStreak(result.longestStreak);
            setCompletedDaysNum(result.completedDaysNum);
            setExpectedDaysNum(result.expectedDaysNum);
            // console.log("Habit Data:", habitData);
        } catch (error) {
            console.error("Error fetching habit data:", error);

            // Reset all relevant states
            setHabitData({});
            setCompletedDays([]);
            setCurrStreak(0);
            setBestStreak(0);
            setCompletedDaysNum(0);
            setExpectedDaysNum(0);

            displayMessage("error", "Network Error");
            navigate("/habits", { replace: true });
        } finally {
            setLoading(false);
        }
    }

    const fetchHabitDetailsforGroup = async () => {
        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL_GROUPS}/getusers?groupId=${groupId}`,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                }
            );




            const result = response.data.data;
            const habit = result.groupHabit;
            const group = result.group;
            const users = result.users;

            const user = users.filter((user) => {
                return user.user == userId
            })


            // console.log("group:", group);
            // console.log(user)
            setGroup(group);
            setHabitData(habit);
            setCompletedDays(user[0].completedDays);
            setCurrStreak(user[0].currentStreak);
            setBestStreak(user[0].longestStreak);
            setCompletedDaysNum(user[0].completedDays.length);
            setExpectedDaysNum(result.expectedDaysNum);
            // console.log("Habit Data:", habitData);
        } catch (error) {
            console.error("Error fetching habit data:", error);

            // Reset all relevant states
            setGroup(null);
            setHabitData({});
            setCompletedDays([]);
            setCurrStreak(0);
            setBestStreak(0);
            setCompletedDaysNum(0);
            setExpectedDaysNum(0);

            displayMessage("error", "Network Error");
            navigate("/grouptracking", { replace: true });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchHabitData = async () => {
            if (isGroupHabit) {
                await fetchHabitDetailsforGroup();
            }

            else {
                await fetchHabitDetailsforIndividual();
            }

        };

        fetchHabitData();
    }, [habitId, userId, groupId]);


    if (completedDaysNum == 0 || expectedDaysNum == 0) {
        percentageCompletion = 0;
    }
    else {
        percentageCompletion = (completedDaysNum / expectedDaysNum) * 100;
    }

    percentageCompletion = Math.ceil(percentageCompletion);



    const daysLeft = Math.floor((new Date(habitData.endDate) - new Date()) / (1000 * 60 * 60 * 24)) || 0;




    if (loading) {
        return (
            <div className="flex justify-center items-center h-[100vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4F46E5',
                    borderRadius: 12,
                },
                components: {
                    Calendar: {
                        colorBgContainer: 'transparent',
                        colorText: 'currentColor',
                        colorSplit: '#e5e7eb',
                        colorTextHeading: '#4F46E5',
                        fontSize: 16,
                        fullBg: 'transparent',
                    }
                }
            }}
        >
            <ConfirmDialog
                openStatus={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={() => handleConfirm(habitId)}
                title="Delete this item?"
                description="This will permanently delete the item from your database."
                confirmText="Delete"
                cancelText="Cancel"
                buttonLoading={buttonLoading}
            />

            <main className='mx-auto px-4 sm:px-6 lg:px-8 py-6 md:max-w-4xl'>
                <Topbar text="Habit Details" />



                <section className='mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden'>
                    <div className="relative p-6 sm:p-8">

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                                    {habitData.habitName}
                                    {console.log("Completed Days", completedDays )}
                                </h2>
                                <span className='px-4 py-1.5 rounded-full bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary font-medium text-sm'>
                                    {habitData.habitCategory}
                                </span>
                            </div>
                            <p className='text-lg text-gray-600 dark:text-gray-300'>
                                {habitData.habitDesc}
                            </p>
                            {isGroupHabit && group && (
                                <p className='text-sm text-primary dark:text-dark-primary my-4 flex items-center gap-2'>
                                    <span><TiGroupOutline size={20} /></span>
                                    {group.groupName}
                                </p>
                            )}
                        </div>


                        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-dark-primary/20 dark:to-dark-primary/10 p-5 rounded-xl backdrop-blur-sm">
                            <div className='flex items-center gap-3 text-primary dark:text-dark-primary'>
                                <FaCheckCircle className="text-xl" />
                                <span className="font-medium">{completedDaysNum}/{expectedDaysNum} times completed</span>
                            </div>
                            <div className='px-5 py-2 rounded-full bg-primary dark:bg-dark-primary text-white dark:text-gray-100 text-sm font-semibold shadow-sm'>
                                {daysLeft} days left
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:shadow-md transition-all'>
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
                                    <FaCalendarAlt className="text-primary dark:text-dark-primary text-lg" />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500 dark:text-gray-400'>Duration</p>
                                    <p className='text-gray-900 dark:text-white font-medium'>{formatDate(habitData.startDate) + " - " + formatDate(habitData.endDate)}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:shadow-md transition-all'>
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
                                    <FaRepeat className="text-primary dark:text-dark-primary text-lg" />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500 dark:text-gray-400'>Frequency</p>
                                    <p className='text-gray-900 dark:text-white font-medium'>{NormaliseText(frequencyMap[habitData.frequency])}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:shadow-md transition-all'>
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
                                    <FaChartColumn className="text-primary dark:text-dark-primary text-lg" />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500 dark:text-gray-400'>Progress</p>
                                    <p className='text-gray-900 dark:text-white font-medium'>{percentageCompletion}% Complete</p>
                                </div>
                            </div>
                        </div>


                        <div className='mb-6'>

                            <div className="relative pt-1">
                                <ProgressBar
                                    value={completedDaysNum}
                                    max={expectedDaysNum}
                                    label="Completion Rate"
                                    size="lg"
                                />
                                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Start</span>
                                    <span>Halfway</span>
                                    <span>Goal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Streaks Section - Enhanced with icons and animations */}
                <section className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/5 dark:bg-dark-primary/10 group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <FaFire className="text-orange-500 dark:text-orange-400 text-xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</h3>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{currStreak}</span>
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">days in a row</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/5 dark:bg-dark-primary/10 group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <FaTrophy className="text-yellow-500 dark:text-yellow-400 text-xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Streak</h3>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{bestStreak}</span>
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">all-time record</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Calendar Section */}
                <section className='mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6'>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-primary dark:text-dark-primary flex items-center gap-2">
                            <FaCalendarAlt />
                            Habit Calendar
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-primary dark:text-dark-primary mr-1" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
                            </div>
                        </div>
                    </div>

                    <Calendar
                        value={calendarValue}
                        fullscreen={false}
                        mode="month"
                        onChange={onChangeCalendar}
                        onPanelChange={(value) => setCalendarValue(value)}
                        cellRender={dateCellRender}
                        className="custom-calendar"
                        headerRender={({ value }) => (
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={() => setCalendarValue(value.clone().subtract(1, 'month'))}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {value.format('MMMM YYYY')}
                                </h3>
                                <button
                                    onClick={() => setCalendarValue(value.clone().add(1, 'month'))}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    />
                </section>

                {/* Notes Section
                <section className='mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6'>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-primary dark:text-dark-primary flex items-center gap-2">
                            <FaNoteSticky />
                            Habit Notes
                        </h2>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3 mb-6'>
                        <Input
                            placeholder="Add a note about your progress..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                            className="flex-grow py-3 border-0 ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-5 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
                        />
                        <PrimaryButton
                            text='Add Note'
                            icon={<FaPlus className="ml-2" />}
                            onClick={handleAddNote}
                            className="bg-primary hover:bg-primary/90 text-white dark:bg-dark-primary dark:hover:bg-dark-primary/90 px-6 rounded-xl h-12 gap-2 font-semibold shadow-sm whitespace-nowrap"
                        />
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {notes.map((note) => (
                            <div key={note.id} className="group p-5 border-l-4 border-primary dark:border-dark-primary bg-gray-50 dark:bg-gray-700/30 rounded-r-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <p className="text-gray-800 dark:text-gray-200 flex-1">
                                        {note.text}
                                    </p>
                                    <div className="text-sm text-primary dark:text-dark-primary whitespace-nowrap pt-1">
                                        {note.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* Action Buttons */}
                {
                    !isGroupHabit && (
                        <section className="mt-6 flex justify-end">
                            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white dark:bg-dark-primary dark:hover:bg-dark-primary/90 rounded-xl font-medium transition-colors"
                            onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDialogOpen(true);
                                }}
                            >
                                Delete Habit
                            </button>
                        </section>
                    )
                }
            </main>

        </ConfigProvider>
    )
}

export default ViewHabit