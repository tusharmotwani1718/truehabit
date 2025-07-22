import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Topbar from '../../utils/Topbar';
import { useMessage, useModal } from '../../../context/index.js';
import { setProfilePicture, removeProfilePicture, logout as logoutSlice } from '../../../store/Slices/authSlice.js';
import axios from 'axios';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';
import { Alert } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import ConfirmDialog from '../../utils/ConfirmDialog.jsx';




function Profile() {
  const { openModal } = useModal();
  const { displayMessage } = useMessage();
  const userData = useSelector(state => state.auth.userData);
  const profileImageRef = useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSendingMail, setIsSendingMail] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [buttonLoading, setButtonLoading] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // get email sent info from localstorage:
  const checkEmailVerificationStatus = () => {
    const raw = localStorage.getItem("email_verification_status");
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      return data.sent && data.sentTo == userData.email && Date.now() < data.expiresAt;
    } catch (e) {
      return false;
    }
  };

  const [emailStatus, setEmailStatus] = React.useState(checkEmailVerificationStatus());

  // Function to get initials from full name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  // useEffect hook:
  useEffect(() => {
    if (!userData || !userData._id) {
      navigate('/');
      displayMessage('error', 'Please Login First');
    }
  }, [])


  // handle delete account:
  const deleteAccount = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL_USERS}/deleteaccount`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });
      dispatch(logoutSlice());
      displayMessage("success", response.data.message);
    } catch (error) {
      console.log(error);
      displayMessage("error", "Network Error")
    }
  }

  const handleConfirm = async () => {
    try {
      setButtonLoading(true);
      await deleteAccount();
      setIsDialogOpen(false); // Only close on success
    } catch (error) {
      console.error("Error deleting account:", error);
      displayMessage("error", "Network Error");
    } finally {
      setButtonLoading(false);
    }
  };

  // handle send mail:
  const handleSendMail = async () => {
    try {
      setIsSendingMail(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL_USERS}/sendMailVerification`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const message = response.data.message;
      displayMessage('success', message || 'Email sent successfully!');


      // store the info in localStorage:
      const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day

      const emailSentData = {
        sent: true,
        expiresAt: Date.now() + oneDayInMs,
        sentTo: userData.email || 'Not provided'
      };

      localStorage.setItem("email_verification_status", JSON.stringify(emailSentData));
      setEmailStatus(true);

    } catch (error) {
      displayMessage('error', 'Failed to send email.');
      console.log(error);
    }
    finally {
      setIsSendingMail(false);
    }
  }

  // Add profile Image:
  // Trigger file input
  const handleAddImage = () => {
    if (profileImageRef.current) {
      profileImageRef.current.click();
    }
  };

  // Handle file change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsUploading(true);
      // console.log("Uploading image...", formData);

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL_USERS}/updateProfileImage`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })



      dispatch(setProfilePicture({ publicLink: response.data.data.profileImage, publicId: response.data.data.profileImagePublicId }));
      displayMessage('success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error("Error uploading image:", error);
      displayMessage('error', 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete image:
  const handleDeleteImage = async (publicId) => {
    try {
      setIsUploading(true);
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL_USERS}/deleteProfileImage`, {
        data: { publicId },
        withCredentials: true,
      });

      if (response?.data?.success) {
        dispatch(removeProfilePicture());
      }

      displayMessage('success', 'Profile picture deleted successfully!');
    } catch (error) {
      // console.error("Error deleting image:", error);
      displayMessage('error', 'Failed to delete image.');
    } finally {
      setIsUploading(false);
    }

  };


  if(!userData || !userData._id) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-200'>Please Login First</h1>
          <button
            onClick={() => navigate('/')}
            className='mt-4 px-6 py-2 bg-primary dark:bg-dark-primary text-white rounded-lg hover:bg-primary/80 dark:hover:bg-dark-primary/80 transition-colors'
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>

    {/* // dialog box: */}
      <ConfirmDialog
        openStatus={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => handleConfirm()}
        title="Delete this account?"
        description="This will permanently delete your account and all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        buttonLoading={buttonLoading}
      />


      <main className='md:w-[90%] mx-auto'>
        <Topbar text="Profile" />


        <section className='mt-8 px-4 sm:px-6 md:px-8 py-5'>
          {
            !!userData && !userData.isEmailVerified && (
              <Alert
                message={`You have not verified your email yet. Please verify your email in the Profile page to unlock all features.`}
                type="warning"
                showIcon
                closable
                className='mb-4'
              />
            )
          }
          {/* Profile Header Card */}
          {/* {console.log(userData)} */}
          <div className={`${!!userData && userData.isEmailVerified ? '' : 'mt-4'} bg-white dark:bg-dark-background rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 sm:p-8 mb-8`}>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              {/* Profile Picture / Avatar */}
              <div className='flex-shrink-0 relative group'>
                {userData.profilePicture && userData.profilePicturePublicId ? (
                  <div className='relative'>
                    {
                      isUploading ? (
                        <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 dark:bg-dark-primary/10 animate-pulse flex items-center justify-center'>
                          <span className='text-gray-500 text-lg'>Deleting...</span>
                        </div>
                      ) : <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className='w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary dark:border-dark-primary shadow-lg'
                      />
                    }
                    {/* Image Action Buttons */}
                    <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2'>
                      <button className='w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors'
                        onClick={() => {
                          handleDeleteImage(userData.profilePicturePublicId);
                        }}
                        disabled={isUploading}
                      >
                        <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' clipRule='evenodd' />
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='relative'>
                    {
                      isUploading ? (
                        <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 dark:bg-dark-primary/10 animate-pulse flex items-center justify-center'>
                          <span className='text-gray-500 text-lg'>Uploading...</span>
                        </div>
                      ) : <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary flex items-center justify-center border-4 border-primary dark:border-dark-primary shadow-lg'>
                        <span className='text-on-primary dark:text-dark-on-primary font-bold text-2xl sm:text-4xl'>
                          {getInitials(userData.fullName)}
                        </span>
                      </div>
                    }
                    {/* Add Image Button */}
                    <button className='absolute bottom-0 right-0 w-8 h-8 bg-primary dark:bg-dark-primary rounded-full flex items-center justify-center border-2 border-white dark:border-dark-background hover:bg-secondary dark:hover:bg-dark-secondary transition-colors shadow-lg'
                      onClick={handleAddImage}
                      disabled={isUploading}
                    >
                      <svg className='w-4 h-4 text-on-primary dark:text-dark-on-primary' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z' clipRule='evenodd' />
                      </svg>
                    </button>

                    {/* Hidden File Input */}
                    <input
                      type='file'
                      ref={profileImageRef}
                      style={{ display: 'none' }}
                      accept='image/*'
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className='flex-1 text-center sm:text-left'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                  <div>
                    <h1 className='text-custom-xl sm:text-custom-xxl font-bold text-onBackgorund dark:text-dark-onBackground mb-2'>
                      {userData.fullName || 'User'}
                    </h1>
                    <p className='text-custom-md text-neutral dark:text-dark-neutral mb-1'>
                      @{userData.username}
                    </p>
                    <p className='text-custom-sm text-neutral dark:text-dark-neutral'>
                      {userData.email}
                    </p>
                  </div>

                  {/* Edit Profile Button */}
                  <button className='w-max mx-auto bg-primary dark:bg-dark-primary text-on-primary dark:text-dark-on-primary px-4 py-2 rounded-lg hover:bg-primary/70 dark:hover:bg-dark-primary/70 transition-colors flex items-center gap-2 font-medium text-custom-sm shadow-md md:mx-0'
                    onClick={() => { openModal("editProfileModal") }}
                  >
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
            {/* Groups Card */}
            <div className='bg-white dark:bg-dark-background rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow duration-300'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary flex items-center justify-center'>
                  <svg className='w-6 h-6 text-on-primary dark:text-dark-on-primary' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                  </svg>
                </div>
                <div>
                  <p className='text-custom-sm text-neutral dark:text-dark-neutral font-medium'>Groups Joined</p>
                  <p className='text-custom-xl font-bold text-onBackgorund dark:text-dark-onBackground'>
                    {userData.groups?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Habits Card */}
            <div className='bg-white dark:bg-dark-background rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow duration-300'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary dark:from-dark-secondary dark:to-dark-primary flex items-center justify-center'>
                  <svg className='w-6 h-6 text-onSecondary dark:text-dakr-onSecondary' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd' />
                  </svg>
                </div>
                <div>
                  <p className='text-custom-sm text-neutral dark:text-dark-neutral font-medium'>Habits Tracked</p>
                  <p className='text-custom-xl font-bold text-onBackgorund dark:text-dark-onBackground'>
                    {userData.habitCollection?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className='mt-8 bg-white dark:bg-dark-background rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6'>
            <h2 className='text-custom-lg font-bold text-onBackgorund dark:text-dark-onBackground mb-4 flex items-center gap-2'>
              <svg className='w-5 h-5 text-primary dark:text-dark-primary' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
              </svg>
              Account Details
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div>
                  <label className='text-custom-xs font-semibold text-neutral dark:text-dark-neutral uppercase tracking-wide'>Full Name</label>
                  <p className='text-custom-md text-onBackgorund dark:text-dark-onBackground mt-1'>
                    {userData.fullName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className='text-custom-xs font-semibold text-neutral dark:text-dark-neutral uppercase tracking-wide'>Username</label>
                  <p className='text-custom-md text-onBackgorund dark:text-dark-onBackground mt-1'>
                    @{userData.username || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='text-custom-xs font-semibold text-neutral dark:text-dark-neutral uppercase tracking-wide'>Email Address</label>
                  <p className="text-custom-md text-onBackgorund dark:text-dark-onBackground mt-1 break-all flex flex-col  md:flex-row md:items-center">
                    {!!userData && userData.email || 'Not provided'}
                    <span
                      className={`inline-flex items-center gap-1 w-max text-sm md:ml-2 mt-2 md:mt-0 px-2 py-0.5 rounded-md font-medium transition duration-300 ${userData.isEmailVerified
                        ? 'text-green-600 bg-green-50 dark:bg-green-900/10'
                        : 'text-red-600 bg-red-50 dark:bg-red-900/10'
                        } `}
                    >
                      {!!userData && userData.isEmailVerified ? (
                        <>
                          <FaCheckCircle className="w-4 h-4" />
                          Verified
                        </>
                      ) : (
                        <>
                          <FaCircleXmark className="w-4 h-4" />
                          Unverified
                        </>
                      )}
                    </span>
                  </p>
                  <div>{!!userData && !userData.isEmailVerified &&
                    <button className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition ${isSendingMail || emailStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleSendMail()}
                      disabled={isSendingMail || emailStatus}
                    >
                      {
                        isSendingMail ? <FaSpinner className='w-5 h-5' /> : <FaCheckCircle className="w-5 h-5" />
                      }
                      {
                        isSendingMail
                          ? 'Sending...'
                          : 'Verify Email'
                      }
                    </button>
                  }
                    {
                      emailStatus && !!userData && !userData.isEmailVerified &&
                      (
                        <p className='text-green-600 my-3 text-custom-md'>Activation Link sent to {userData.email}</p>
                      )
                    }

                  </div>
                </div>
                <div>
                  <label className='text-custom-xs font-semibold text-neutral dark:text-dark-neutral uppercase tracking-wide'>Member Since</label>
                  <p className='text-custom-md text-onBackgorund dark:text-dark-onBackground mt-1'>
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone - Delete Account */}
          <div className='mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <h3 className='text-custom-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd'

                    />
                  </svg>
                  Delete Account
                </h3>
                <p className='text-custom-sm text-red-600 dark:text-red-400'>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>

              <button className='bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center gap-2 font-medium text-custom-sm shadow-md whitespace-nowrap'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' clipRule='evenodd' />
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default Profile