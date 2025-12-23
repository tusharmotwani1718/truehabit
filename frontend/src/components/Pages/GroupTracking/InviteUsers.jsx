import Input from '../../Form/Input/Input.jsx';
import { useForm } from 'react-hook-form';
import { useMessage, useModal } from '../../../context/index.js';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Avatar, List } from 'antd';
import { FaRegUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import api from '../../../helpers/refreshToken.js';



function InviteUsers({
    groupId = ""
}) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm()


    const searchValue = watch("name");
    const { closeModal } = useModal();


    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(false);

    const { displayMessage } = useMessage();
    const [buttonLoading, setButtonLoading] = useState(false);

    const onSubmit = async (formData) => {
        try {
            console.log(formData, groupId);
            setButtonLoading(true);
            const response = await api.post(
                `${import.meta.env.VITE_API_BASE_URL_GROUPS}/inviteuser`,
                {
                    groupId,
                    userId: formData.selectedUser
                },
                {
                    withCredentials: true
                }
            );

            displayMessage('success', response.data.message || "User Invited Successfully");
            reset();
            closeModal();




        } catch (error) {
            displayMessage('error', error.response.data.message || "Network Error");
            // console.log(error);
            // reset();
            // setUsers(null);

        }
        finally {
            setButtonLoading(false);
        }
    }

    const fetchUsers = async (name) => {
        try {
            setLoading(true);
            const response = await api.get(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/getusernames?name=${name}`, {
                withCredentials: true,
            });
            setUsers(response.data.data);
        } catch (error) {
            setUsers([]);
            displayMessage("error", error.response?.data?.message || "Network Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchValue?.trim()) {
                fetchUsers(searchValue);
            } else {
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(debounce);
    }, [searchValue]);



    useEffect(() => {

    }, [])




    return (
        <div className="p-6 w-full">
            <div className="text-center mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                    Invite Users
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Search for users
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="text"
                    label="Name"
                    placeholder="Enter Username"
                    classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("name", {
                        required: true
                    })}
                />
                {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}

                {/* display users list */}
                {
                    users && users.length > 0 ? (
                        <div className="my-4 overflow-y-auto max-h-[50vh] sm:max-h-[35vh] py-2">
                            <List
                                itemLayout="horizontal"
                                dataSource={users}
                                renderItem={(user) => (
                                    <List.Item
                                        extra={
                                            <input
                                                type="radio"
                                                value={user._id}
                                                {...register("selectedUser", { required: "Please select a user" })}
                                                className="w-5 h-5 accent-blue-500 cursor-pointer"
                                            />
                                        }
                                    >




                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    icon={!user.profileImage ? <FaRegUser /> : null}
                                                    src={user.profileImage || undefined}
                                                />
                                            }
                                            title={user.fullName}
                                            description={user.username}
                                        />
                                    </List.Item>
                                )}
                            />
                            {errors.selectedUser && (
                                <p className="mt-2 text-sm text-red-600">{errors.selectedUser.message}</p>
                            )}
                        </div>


                    ) :
                        (
                            <div className="mt-4">
                                {
                                    searchValue && searchValue.length > 0 && (
                                        !loading ? (
                                            <p className="text-sm text-gray-600">
                                                No users found
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                Loading...
                                            </p>
                                        )
                                    )
                                }
                            </div>
                        )
                }



                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={buttonLoading} // Add this to disable during loading
                        className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium flex items-center justify-center ${buttonLoading ? 'opacity-80 cursor-not-allowed' : ''
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
                                Inviting User...
                            </>
                        ) : (
                            'Invite User'
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}

export default InviteUsers
