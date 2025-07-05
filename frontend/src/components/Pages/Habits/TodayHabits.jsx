import React, { useEffect, useState } from 'react';
import { Card, Tabs, Topbar, Habit, Spinner, ProgressBar } from '../../index';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHabits } from '../../../store/Slices/habitSlice.js';
import axios from 'axios';
import { fetchGrouphabits, setGroupHabits } from '../../../store/Slices/groupSlice.js';
import { useNavigate } from 'react-router';
import { useMessage } from '../../../context/index.js';





function TodayHabits({
    title = "Today's Habits",
    fetchGroups = false,
    topbar = true
}) {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.auth.userData);
    const [todayScheduledHabits, setTodayScheduledHabits] = useState(0);
    const [todayCompletedHabits, setTodayCompletedHabits] = useState(0);
    const [todayRemainingHabits, setTodayRemainingHabits] = useState(0);
    const navigate = useNavigate();
    const { displayMessage } = useMessage();

    // Get data from Redux store
    const { currentHabits, loading, error } = useSelector(state => state.habit);
    const { groupHabits, groupLoading, groupError } = useSelector(state => state.group);

    // Determine which data source to use
    const habits = fetchGroups ? groupHabits : currentHabits;
    const isLoading = fetchGroups ? groupLoading : loading;
    const hasError = fetchGroups ? groupError : error;

    // useEffect to redirect user if not logged in:
    useEffect(() => {
        if (!userData) {
            navigate('/');
            displayMessage('error', 'Please Login First');
        }
    }, [])

    // Main data loading effect
    useEffect(() => {
        if (fetchGroups) {
            dispatch(fetchGrouphabits());
        } else {
            dispatch(fetchHabits("today"));
        }
    }, [dispatch, fetchGroups]);

    // Effect to calculate habit statistics whenever habits change
    useEffect(() => {
        if (!habits || habits.length === 0) {
            setTodayScheduledHabits(0);
            setTodayCompletedHabits(0);
            setTodayRemainingHabits(0);
            return;
        }

        const totalHabits = habits.length;
        setTodayScheduledHabits(totalHabits);

        const currentDate = new Date();
        const completedHabits = habits.filter(habit => {
            if (!Array.isArray(habit.completedDays)) return false;

            return habit.completedDays.some(d => {
                try {
                    const habitDate = new Date(d);
                    return habitDate.toDateString() === currentDate.toDateString();
                } catch (e) {
                    console.error("Invalid date format:", d);
                    return false;
                }
            });
        }).length;

        setTodayCompletedHabits(completedHabits);
        setTodayRemainingHabits(totalHabits - completedHabits);
    }, [habits]);

    const Oncheckhabit = () => {
        setTodayCompletedHabits((prev) => prev + 1)
        todayRemainingHabits > 0 ? setTodayRemainingHabits((prev) => prev - 1) : setTodayRemainingHabits(0)
    }

    if (error || groupError) return;

    const renderTabContent = () => {
        if (loading || groupLoading) {
            return (
                <div className="flex justify-center items-center h-64 w-full">
                    <Spinner size="lg" />
                </div>
            );
        }

        // returns true only if the habit is marked as done for the selected date
        const checkDate = (completedDays = [], date) => {
            return completedDays?.some(d => {
                const habitDate = new Date(d); // Ensure it's a Date object
                return habitDate.getFullYear() === date.getFullYear() &&
                    habitDate.getMonth() === date.getMonth() &&
                    habitDate.getDate() === date.getDate();
            });
        };

        const currentDate = new Date();

        return habits.length > 0 ? (
            <div className="grid gap-5">
                {habits.map((habit, index) => (

                    <Habit
                        habitId={habit._id}
                        key={index}
                        title={habit.habitName}
                        description={habit.habitDesc}
                        completed={checkDate(habit.completedDays, currentDate)}
                        category={habit.habitCategory}
                        frequency={habit.frequency}
                        notesNumber={habit.notes}
                        status={habit.status}
                        Oncheckhabit={Oncheckhabit}
                        isTodayHabit={true}
                        groupId={habit.groupId?._id || null}
                        groupName={habit.groupId?.groupName || null}
                        groupDesc={habit.groupId?.groupDesc || null}


                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
                <div className="bg-color-primary/10 dark:bg-color-dark-primary/20 p-4 rounded-full mb-6">
                    <svg className="w-16 h-16 text-color-primary dark:text-color-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    No habits to display
                </h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    Create new habits to track your daily progress and build consistency {fetchGroups ? "with your group" : ""}.
                </p>
            </div>
        );
    };

    const tabOptions = [
        {
            label: "Today",
            content: renderTabContent()
        }
    ];

    return (
        <div className="min-h-screen py-8 w-full bg-color-background dark:bg-color-dark-background mx-auto">
            <main className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                {
                    topbar && (
                        <div className="mb-8">
                            <Topbar text="Today's Habits"/>
                        </div>
                    )
                }

                {/* Stats Cards */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                            <div className="p-5">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scheduled</h3>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-3xl font-extrabold text-color-primary dark:text-color-dark-primary">{todayScheduledHabits}</span>
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">habits</span>
                                </div>
                            </div>
                            <div className="h-1 bg-color-primary dark:bg-color-dark-primary"></div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                            <div className="p-5">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</h3>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-3xl font-extrabold text-green-500">{todayCompletedHabits}</span>
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">habits</span>
                                </div>
                            </div>
                            <div className="h-1 bg-green-500"></div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                            <div className="p-5">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</h3>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-3xl font-extrabold text-color-secondary dark:text-color-dark-secondary">{todayRemainingHabits}</span>
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">habits</span>
                                </div>
                            </div>
                            <div className="h-1 bg-color-secondary dark:bg-color-dark-secondary"></div>
                        </div>
                    </div>
                </section>

                {/* Progress indicator */}
                <section className="mt-6 w-full mx-auto my-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Progress</h3>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {todayScheduledHabits > 0 ? Math.round((todayCompletedHabits / todayScheduledHabits) * 100) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${todayScheduledHabits > 0 ? (todayCompletedHabits / todayScheduledHabits) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </section>

                {/* Habits List */}
                <section className="mb-8">
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                        <div className="md:h-[60vh] overflow-y-auto w-full">
                            <Tabs tabs={tabOptions} />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default TodayHabits;