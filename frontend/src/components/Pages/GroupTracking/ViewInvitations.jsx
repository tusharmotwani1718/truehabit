import { useState, useEffect } from 'react'
import axios from 'axios';
import Topbar from '../../utils/Topbar';
import { useMessage } from '../../../context';
import { useNavigate } from 'react-router';
import { Alert } from 'antd';
import { useSelector } from 'react-redux';

function ViewInvitations() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const { displayMessage } = useMessage();
    const userData = useSelector(state => state.auth.userData);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL_GROUPS}/getInvites`,
                    { withCredentials: true }
                );

                setInvitations(response.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchInvitations();
    }, []);

    // useEffect hook:
    useEffect(() => {
        if (!userData) {
            navigate('/');
            displayMessage('error', 'Please Login First');
        }
    }, [])

    const handleAcceptInvite = async (inviteId) => {
        setLoading(true);
        try {
            // accept api call:
            const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/acceptDeclineInvite`, { invitationId: inviteId, action: 'accepted' }, { withCredentials: true, headers: { "Content-Type": "application/json" } });


            // set the invitation status to accepted
            setInvitations(prev => prev.map(invite => {
                if (invite._id === inviteId) {
                    return { ...invite, status: 'accepted' };
                }
                return invite;
            }))
            // console.log('Invite accepted:', inviteId);

            displayMessage('success', response.data.message || "Invitation accepted successfully");
        } catch (error) {
            // console.error('Error accepting invite:', error);
            displayMessage('error', 'Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeclineInvite = async (inviteId) => {
        setLoading(true);
        try {
            // decline api call:
            const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/acceptDeclineInvite`, { invitationId: inviteId, action: 'declined' }, { withCredentials: true, headers: { "Content-Type": "application/json" } });

            // set the invitation status to declined:
            setInvitations(prev => prev.map(invite => {
                if (invite._id === inviteId) {
                    return { ...invite, status: 'declined' };
                }
                return invite;
            }))
            // console.log('Invite declined:', inviteId);

            displayMessage('success', response.data.message || "Invitation declined successfully");
        } catch (error) {
            // console.error('Error declining invite:', error);
            displayMessage('error', 'Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className='w-full md:w-[90%] mx-auto px-4 sm:px-6 lg:px-8 min-h-screen'>
            <Topbar text="Invitations" className={'h-12'} />

            <section className='mt-16'>
                {
                    !!userData && !userData.isEmailVerified && (
                        <Alert
                            message={`You have not verified your email yet. Please verify your email in the Profile page to unlock all features.`}
                            type="warning"
                            showIcon
                            closable
                            className='my-4'
                        />
                    )
                }
                {invitations && invitations.length > 0 ? (
                    <div className="space-y-6">
                        {invitations.map((invite, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl bg-on-primary dark:bg-dark-on-primary shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                            >
                                {/* Gradient accent bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                                <div className="p-6 sm:p-8">
                                    {/* Header Section */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                                                <h2 className="text-xl sm:text-2xl font-bold text-onBackgorund dark:text-dark-onBackground leading-tight">
                                                    {invite.groupId.groupName}
                                                </h2>
                                            </div>

                                            <p className="text-gary-500 dark:text-dark-neutral text-sm sm:text-base leading-relaxed mb-4">
                                                {invite.groupId.groupDesc}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-neutral">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <span>
                                                    Invited by <span className="font-semibold text-primary dark:text-dark-primary">{invite.groupId.admin.fullName} ({invite.groupId.admin.username})</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex-shrink-0">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${invite.status === 'accepted'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                                                : invite.status === 'declined'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                                                    : 'bg-background dark:bg-dark-background text-onBackgorund dark:text-dark-onBackground border border-primary/20'
                                                }`}>
                                                {invite.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Only show if status is pending */}
                                    {invite.status === 'pending' && (
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={() => handleAcceptInvite(invite._id)}
                                                disabled={loading || (!!userData && !userData.isEmailVerified)}
                                                className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept Invitation
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleDeclineInvite(invite._id)}
                                                disabled={loading || (!!userData && !userData.isEmailVerified)}
                                                className="flex-1 sm:flex-none px-6 py-3 bg-transparent hover:bg-neutral/10 dark:hover:bg-dark-neutral/10 text-neutral dark:text-dark-neutral font-semibold rounded-xl border-2 border-neutral/30 dark:border-dark-neutral/30 hover:border-neutral/50 dark:hover:border-dark-neutral/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Decline
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-background dark:bg-dark-background flex items-center justify-center">
                            <svg className="w-12 h-12 text-neutral dark:text-dark-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-onBackgorund dark:text-dark-onBackground mb-2">
                            No pending invitations
                        </h3>
                        <p className="text-gray-600 text-sm dark:text-dark-neutral max-w-md mx-auto">
                            You're all caught up! When someone invites you to join a group, their invitations will appear here.
                        </p>
                    </div>
                )}
            </section>
        </main>
    )
}

export default ViewInvitations