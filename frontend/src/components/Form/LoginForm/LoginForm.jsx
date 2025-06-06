import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { Input } from '../../index.js'
import axios from 'axios'
import { useMessage, useModal } from '../../../context/index.js'
import { useDispatch } from 'react-redux'
import { login as loginSlice } from '../../../store/Slices/authSlice.js'




function LoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const { displayMessage } = useMessage();
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const [buttonLoading, setButtonLoading] = useState(false);

  const onSubmit = async (formData) => {
    try {
      setButtonLoading(true);
      await axios({
        data: formData,
        url: `${import.meta.env.VITE_API_BASE_URL_USERS}/login`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })
        .then((response) => {
          reset();
          closeModal();
          // console.log(response)
          dispatch(loginSlice(response.data.data))
          // console.log(response.data.data)
          displayMessage('success', response.data.message);
        })
        .catch((err) => {
          // reset();
          // console.log(err)
          displayMessage('error', err.response.data.message || "Failed to login");
        })
    } catch (error) {
      displayMessage('error', "Network Error")
      // console.log(error)
      // reset();
    }
    finally {
      setButtonLoading(false);
    }
  }

  return (
    <div className="p-6 w-full">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="email"
          label="Email"
          placeholder="Enter your email..."
          classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("email", {
            required: true
          })}
        />

        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          classname="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("password", {
            required: true
          })}
        />

        <div className="flex items-center justify-between">
          {/* <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register("rememberMe")}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div> */}

          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
        </div>

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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>

      </form>
    </div>
  )
}

export default LoginForm