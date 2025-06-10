import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useMessage } from '../../../context/index.js';
import { activateAccount as activateAccountSlice } from '../../../store/Slices/authSlice.js';
import { useDispatch, useSelector } from 'react-redux';



function VerifyEmail() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { displayMessage } = useMessage();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const dispatch = useDispatch();
    const userData = useSelector(state => state.auth.userData);

    if(!userData) {
        navigate('/');
        displayMessage('error', 'Please Login First');
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
                    await axios.get(`${import.meta.env.VITE_API_BASE_URL_USERS}/verify-email?token=${token}`,
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
