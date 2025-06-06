import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';


function AuthLayout({
    children,
    authentication = true
}) {

    const [loader, setLoader] = useState(false);
    const authStatus = useSelector(state => state.auth.authStatus);

    const navigate = useNavigate();

    useEffect(() => {
        if (authStatus && authStatus !== authentication) {
            navigate('/todayhabits')
        }
        else if (!authStatus && authStatus !== authentication) {
            navigate('/')
        }

        setLoader(false);
    }
        , [authStatus, navigate, authentication])

    return loader ? <h1>Loading...</h1> : <>{children}</>
}

export default AuthLayout;
