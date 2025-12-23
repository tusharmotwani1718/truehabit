import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useMessage } from '../../../context/index.js';
import { activateAccount as activateAccountSlice } from '../../../store/Slices/authSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../helpers/refreshToken.js';



function VerifyEmail() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { displayMessage } = useMessage();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const dispatch = useDispatch();
    const userData = useSelector(state => state.auth.userData);

    if (!userData || !userData._id) {
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



    if (!token) {
        navigate('/');
    }

    useEffect(() => {
        ; (
            async function () {
                try {
                    setLoading(true);
                    // console.log(token)
                    await api.get(`/verify-email?token=${token}`,
                        {
                            withCredentials: true,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }


                    );

                    dispatch(activateAccountSlice());
                    displayMessage('success', 'Email verified successfully!');
                    navigate('/');

                } catch (error) {
                    navigate('/');
                    displayMessage('error', 'Failed to verify email.');
                    console.log(error)
                }
                finally {
                    setLoading(false);
                }
            }
        )()
    }, [])

    return (
        !!loading && <h1 className='text-center text-xl'>Verifying...</h1>
    )
}

export default VerifyEmail;
