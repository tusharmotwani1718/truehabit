
import React, { useEffect, useState } from 'react'
import { CheckMark, ConfirmDialog } from '../../../index'
import { MdDelete, MdEdit } from 'react-icons/md'
import { IoIosStats } from "react-icons/io";
import { IoCalendarClear } from "react-icons/io5";
import { NormaliseText, returnDate } from '../../../../../../shared/functions/index.js';
import axios from 'axios';
import { ApiError } from '../../../../../../backend/src/utils/ApiError';
import { useMessage, useModal } from '../../../../context';
import { deleteHabit as deleteHabitSlice, updateHabitCompletion as updateHabitSlice } from '../../../../store/Slices/habitSlice';
import { useDispatch, useSelector } from 'react-redux';
import { BsCalendar2XFill } from "react-icons/bs";
import { RiGroupLine } from "react-icons/ri";
import { updateHabitCompletion as updateGroupCompletion } from '../../../../store/Slices/groupSlice';
import { removehabit as removehabitSlice } from '../../../../store/Slices/authSlice.js';

function Habit({
    title = "Title",
    description = "Description",
    completed = false,
    completedTime,
    category = "General",
    frequency = "Daily",
    notesNumber = 0,
    habitId,
    status = "active",
    showCheckMark = true,
    startDate,
    endDate,
    Oncheckhabit,
    isTodayHabit = false,
    className = "",
    groupId,
    groupName,
    groupDesc,
    ...props
}) {
    const [habitCompleted, setHabitCompleted] = useState(completed);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { displayMessage } = useMessage();
    const [buttonLoading, setButtonLoading] = useState(false);
    const dispatch = useDispatch();
    const [isChecked, setIsChecked] = useState(completed);
    const [isMarking, setIsMarking] = useState(false);
    const userData = useSelector(state => state.auth.userData);


    // modal context:
    const { openModal } = useModal();

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
            dispatch(deleteHabitSlice(deleteId)); // delete the habit from the database.
            dispatch(removehabitSlice(deleteId)); // remove the habit from the user's habits.
            setIsDialogOpen(false); // Only close on success
        } catch (error) {
            console.error("Error deleting habit:", error);
            displayMessage("error", "Network Error");
        } finally {
            setButtonLoading(false);
        }
    };

    const markHabitDone = async (habitId) => {
        setIsMarking(true);
        const date = new Date();
        let url;
        let id;

        if (groupId) {
            url = `${import.meta.env.VITE_API_BASE_URL_GROUPS}/updatehabitCompletion`;
            id = groupId
        }

        else {
            url = `${import.meta.env.VITE_API_BASE_URL_HABITS}/updatehabitstatus`
            id = habitId;
        }

        try {
            // console.log(id);
            await axios.patch(
                `${url}`,
                {
                    habitId: id,
                    groupId: id,
                    completionDate: date
                },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                }
            );

            if (groupId) {
                dispatch(updateGroupCompletion({ _id: groupId, completionDate: date }));
            }

            else {
                dispatch(updateHabitSlice({
                    _id: habitId,
                    completionDate: date
                }));
            }
            setIsChecked(true);
            setHabitCompleted(true);
            Oncheckhabit();
        } catch (error) {
            console.log(error);
            setIsChecked(false); // Revert if failed
            setHabitCompleted(false);
            // don't update checkmark if the habit date is not added as completion date:
            throw new ApiError(500, "Network Error");
        } finally {
            setIsMarking(false);
        }
    }



    const frequencyMap = {
        1: "Every Day",
        2: "Every Other Day",
        3: "Every 3 Days",
        7: "Weekly",
        30: "Monthly"
    }

    return (
        <>
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

            <div className={`relative overflow-hidden rounded-lg sm:rounded-xl shadow-sm bg-white dark:bg-gray-800 transition-all hover:shadow-md border-l-4 sm:border-l-[6px] border-primary dark:border-dark-primary mb-3 sm:mb-4 group ${className}`}
                {...props}
            >
                <div className="p-4 sm:p-5">
                    {/* Header Section */}
                    <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-start gap-2 sm:gap-3 flex-grow">
                            {status === "active" && showCheckMark && (
                                <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                                    <CheckMark
                                        checked={isChecked}
                                        onChange={() => markHabitDone(habitId)}
                                        disabled={isMarking || completed || (!!userData && !userData.isEmailVerified)}
                                        tooltip={"Locked until next date"}
                                    />
                                </div>
                            )}
                            <div className="flex-grow min-w-0">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                                    {title}
                                </h2>
                                {description && (
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {description}
                                    </p>
                                )}

                                {/* Group information */}
                                {groupName && (
                                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs text-primary dark:text-dark-primary">
                                        <RiGroupLine size={12} className="flex-shrink-0" />
                                        <span className="font-medium truncate max-w-[120px] sm:max-w-[180px]">
                                            {groupName}
                                        </span>
                                        {groupDesc && (
                                            <span className="text-gray-500 dark:text-gray-400 truncate max-w-[100px] sm:max-w-[180px]">
                                                - {groupDesc}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {habitCompleted && (
                                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium">
                                    Completed
                                </span>
                            )}
                            <div className="flex gap-0.5 sm:gap-1">
                                <button
                                    aria-label="View Statistics"
                                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                                >
                                    <IoIosStats size={16} className="sm:h-[18px]" />
                                </button>
                                <button
                                    aria-label="View Calendar"
                                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
                                >
                                    <IoCalendarClear size={16} className="sm:h-[18px]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                        {/* Tags/Categories */}
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs font-medium bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary border border-primary/20 dark:border-dark-primary/30">
                                {NormaliseText(category)}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs font-medium bg-neutral/10 dark:bg-dark-neutral/20 text-neutral dark:text-dark-neutral border border-neutral/20 dark:border-dark-neutral/30">
                                {NormaliseText(frequencyMap[frequency])}
                            </span>
                        </div>

                        {/* Date Range */}
                        {startDate && endDate && (
                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <BsCalendar2XFill size={12} className="flex-shrink-0" />
                                <span>{returnDate(startDate)} - {returnDate(endDate)}</span>
                            </div>
                        )}

                        {/* Notes */}
                        {notesNumber > 0 && (
                            <button className="text-xs text-blue-500 dark:text-blue-400 hover:underline self-start flex items-center gap-1">
                                <span>View {notesNumber} note{notesNumber > 1 ? 's' : ''}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                {!isTodayHabit && (
                    <div className="flex justify-end border-t border-gray-100 dark:border-gray-700/50 p-2 sm:p-3 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex gap-0.5 sm:gap-1">
                            <button
                                aria-label="Edit habit"
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal("editHabitModal", { habitId })
                                }}
                            >
                                <MdEdit size={16} className="sm:h-[18px]" />
                            </button>
                            <button
                                aria-label="Delete habit"
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDialogOpen(true);
                                }}
                            >
                                <MdDelete size={16} className="sm:h-[18px]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Habit