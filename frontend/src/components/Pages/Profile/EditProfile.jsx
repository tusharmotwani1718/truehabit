import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useMessage, useModal } from '../../../context/index.js';
import axios from 'axios';
import { Controller, set, useForm, useWatch } from 'react-hook-form'
import Input from '../../Form/Input/Input.jsx';
import { updateProfile as updateProfileSlice } from '../../../store/Slices/authSlice.js';
import api from '../../../helpers/refreshToken.js';




function EditProfile({
    userId
}) {

    const { userData } = useSelector(state => state.auth);
    const [buttonLoading, setButtonLoading] = useState(false);
    const dispatch = useDispatch();
    const { displayMessage } = useMessage();
    const {closeModal} = useModal();

    // react-hook-form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        control
    } = useForm({
        defaultValues: {
            habitName: "",
            habitDesc: "",
            habitCategory: "",
            startDate: "",
            endDate: ""

        }
    });



    const onSubmit = async (data) => {
        // console.log("Form Data:", data);
        try {
            setButtonLoading(true);
            const { newName, newUsername } = data;
            const response = await api.patch(`/updateDetails`, { newName, newUsername }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            dispatch(updateProfileSlice(response.data.data));
            displayMessage("success", response.data.message || "Profile updated successfully");
            closeModal();
        } catch (error) {
            displayMessage("error", error.response.data.message || "Error updating profile");
            console.log(error);
        }
        finally {
            setButtonLoading(false);
        }
    }


    // use to disable the update button, if no field is changed
    const watchedFields = useWatch({ control });
    const [formChanged, setFormChanged] = useState(false);
    useEffect(() => {
        const checkIfChanged = () => {
            if (!userData || !watchedFields) return false;

            const { newName, newUsername } = watchedFields;

            return (
                newName !== userData.fullName ||
                newUsername !== userData.username
            );
        };

        setFormChanged(checkIfChanged());
    }, [watchedFields, userData]);


    useEffect(() => {
        if (userData) {
            reset({
                newName: userData.fullName || "",
                newUsername: userData.username || ""
            });
        }
    }, [userData, reset]);




    return (
        <div className="p-6 w-full flex flex-col">
            <div className="text-center mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                    Edit Profile
                </h2>

            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="text"
                    label="Name"
                    placeholder="Enter updated Name"
                    classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("newName", {
                        required: true,
                        minLength: 3,
                        maxLength: 50
                    })}
                />
                {errors.newName && (
                    <p className="mt-2 text-sm text-red-600">{errors.newName.message}</p>
                )}

                <Input
                    type="text"
                    label="Username"
                    placeholder="Enter new Username"
                    classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("newUsername", {
                        required: true,
                        minLength: 5
                    })}
                />
                {errors.newUsername && (
                    <p className="mt-2 text-sm text-red-600">{errors.newUsername.message}</p>
                )}



                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={buttonLoading || !formChanged} // Add this to disable during loading
                        className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium flex items-center justify-center ${buttonLoading || !formChanged ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                    >
                        {buttonLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Update Profile...
                            </>
                        ) : (
                            'Update Profile'
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}

export default EditProfile
