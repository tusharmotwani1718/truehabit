import React from 'react'
import { ConfirmDialog, PrimaryButton, Spinner, TodayHabits, Topbar } from '../../index.js'
import { MdAdd, MdCalendarToday, MdDelete, MdGroupOff, MdGroups, MdPerson } from 'react-icons/md'
import { useNavigate } from 'react-router'
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { setGroups as setGroupsSlice, deleteGroup as deleteGroupSlice } from '../../../store/Slices/groupSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { useMessage, useModal } from '../../../context/index.js';
import { Alert } from 'antd';
import { removeGroup as removeGroupSlice } from '../../../store/Slices/authSlice.js';



function GroupTracking() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // to handle delete dialog
  const [buttonLoading, setButtonLoading] = useState(false);
  const { displayMessage } = useMessage();
  const dispatch = useDispatch();
  // modal context:
  const { openModal } = useModal();

  const userID = useSelector(state => state.auth.userData?._id);
  const isEmailVerified = useSelector(state => state.auth.userData?.isEmailVerified);
  const { groups } = useSelector(state => state.group);

  // fetch groups:
  // const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const deleteGroup = async (groupId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/deletegroup`,
        {
          data: { groupId },
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
      await deleteGroup(deleteId);
      dispatch(deleteGroupSlice(deleteId)); // delete the group from the database.
      dispatch(removeGroupSlice(deleteId)); // remove the group from the user's groups.
      setIsDialogOpen(false); // Only close on success
    } catch (error) {
      console.error("Error deleting Group:", error);
      displayMessage("error", "Network Error");
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    ; (
      async function fetchGroups() {
        try {
          setLoading(true);
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/getgroups`, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          // console.log(response.data.data.groups)
          // setGroups(response.data.data.groups);
          dispatch(setGroupsSlice(response.data.data.groups))
        } catch (error) {
          console.error('Error fetching groups:', error);
          // setGroups([]);
        }
        finally {
          setLoading(false);
        }
      }
    )()
  }, [])


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>

     <main className='w-full sm:w-[95%] md:w-[90%] lg:w-[90%] mx-auto px-4 sm:px-0 overflow-x-hidden min-h-screen'>
  <Topbar text='Group Tracking' className={"h-16 sm:h-18 md:h-20"} />
  
  <section className='mt-4 sm:mt-5 md:mt-6 flex flex-wrap gap-4 sm:gap-5 md:gap-6 px-2 sm:px-4 md:px-7 h-auto my-4 sm:my-5 md:my-6'>
    {
      !isEmailVerified && (
        <Alert
          message="Please verify your email to create groups"
          type="warning"
          showIcon
          closable
          className="w-full mx-auto"
        />
      )
    }
    {/* Action Buttons */}
    <div className='w-full sm:w-[90%] md:w-[85%] mx-auto my-4 sm:my-6 md:my-8 flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 sm:gap-2'>
      <PrimaryButton
        text='Create Group'
        icon={<MdAdd size={18} className="sm:w-5 sm:h-5" />}
        onClick={() => openModal('addGroupModal')}
        background={false}
        classes={`w-full sm:w-auto text-sm sm:text-base ${isEmailVerified ? 'text-primary dark:text-on-primary hover:text-primary dark:text-dark-primary dark:hover:text-primary' : 'text-neutral dark:text-dark-neutral pointer-events-none opacity-50'}`}
        disabled={!isEmailVerified}
      />
      <PrimaryButton
        text='Invitations'
        onClick={() => navigate('viewinvites')}
        background={false}
        classes='w-full sm:w-auto text-sm sm:text-base hover:text-primary dark:text-dark-primary dark:hover:text-primary'
      />
    </div>

    {/* Group Cards */}
    {groups && groups.length > 0 ? groups.map((group) => {
      return (
        
        <div
          key={group._id}
          className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[350px] mx-auto md:mx-0"
        >
          <ConfirmDialog
            openStatus={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onConfirm={() => handleConfirm(group._id)}
            title="Delete this group?"
            description="This will permanently delete the group from your profile."
            confirmText="Delete"
            cancelText="Cancel"
            buttonLoading={buttonLoading}
          />
          <div
            className='w-full flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl bg-on-primary dark:bg-dark-background shadow-md transition-all duration-300 hover:shadow-xl border border-neutral/10 dark:border-dark-neutral/10 cursor-pointer'
            onClick={() => navigate(`/grouptracking/${group._id}`)}
            style={{ position: 'relative' }}
          >
            {/* Header with Group Name and Member Count */}
            <div className='flex items-center justify-between gap-2'>
              <h2 className='font-bold text-base sm:text-lg md:text-custom-md text-primary dark:text-dark-primary truncate flex-1 min-w-0'>
                {group.groupName}
              </h2>
              <div className='flex gap-1.5 sm:gap-2 items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/15 dark:bg-dark-primary/15 text-primary dark:text-dark-primary flex-shrink-0'>
                <MdGroups className="text-inherit w-4 h-4 sm:w-5 sm:h-5" />
                <span className='font-medium text-sm sm:text-base'>{group.habits[0].users.length || 0}</span>
              </div>
            </div>

            {/* Habit Name */}
            <h3 className='font-semibold text-sm sm:text-base text-onBackgorund dark:text-dark-onBackground line-clamp-2'>
              {group.habits[0].habitName}
            </h3>

            {/* Description with Background Highlight */}
            <div className='bg-primary/5 dark:bg-dark-primary/5 p-2.5 sm:p-3 rounded-md sm:rounded-lg'>
              <p className='text-neutral dark:text-dark-neutral text-xs sm:text-sm md:text-custom-sm line-clamp-3'>
                {group.groupDesc}
              </p>
            </div>

            {/* Creator Info */}
            <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm md:text-custom-sm mt-1 p-2 rounded-lg">
              <div className="bg-primary dark:bg-dark-primary rounded-full p-1 sm:p-1.5 text-on-primary dark:text-dark-on-primary flex-shrink-0 mt-0.5 sm:mt-0">
                <MdPerson size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <p className='text-neutral dark:text-dark-neutral leading-relaxed'>
                Created by: <span className='font-semibold text-onBackgorund dark:text-dark-onBackground break-words'>
                  {group.admin.fullName} <span className='opacity-70 text-xs sm:text-sm'>({group.admin.username})</span>
                </span>
              </p>
            </div>

            {/* Delete Button */}
            {userID === group.admin._id && (
              <button
                aria-label="Delete Group"
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 rounded-full hover:bg-primary/10 dark:hover:bg-dark-primary/10 text-neutral hover:text-primary dark:text-dark-neutral dark:hover:text-dark-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <MdDelete size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
            )}
          </div>
        </div>
      )
    }) : (
      <div className="flex flex-col justify-center items-center h-48 sm:h-56 md:h-64 w-full mx-auto text-center px-4">
        <MdGroupOff className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600 mb-2 sm:mb-3" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-300">
          No Groups Found
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs sm:max-w-sm">
          You haven't joined or created any groups yet.
        </p>
      </div>
    )}
  </section>

  <div className="text-center w-full mx-auto my-8 sm:my-9 md:my-10 px-4">
    <PrimaryButton 
      text='See Today Group Habits' 
      onClick={() => navigate('/grouptracking/today/viewtodayhabits')}
      classes="w-full sm:w-auto text-sm sm:text-base"
    />
  </div>
</main>
    </>
  )
}

export default GroupTracking;