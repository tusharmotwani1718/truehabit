import { Home, About, FeedBack, Contact, SignupForm, AuthTabs, Habits, Dashboard, AddHabit, TodayHabits, EditHabit, ViewHabit, GroupTracking, ViewTodayGroupHabits, InviteUsers, ViewInvitations, Profile, EditProfile } from './components/index.js';
import Layout from './Layout.jsx';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { MessageProvider, ModalProvider, ThemeProvider, useMessage } from './context/index.js';
import ModalWindow from './ant-design/ModalWindow.jsx';
import Message from './ant-design/Message.jsx';
import { Provider, useDispatch, useSelector } from 'react-redux';
import LoggedinLayout from './LoggedinLayout.jsx';
import { useEffect, useState } from 'react';
import AuthLayout from './AuthLayout.jsx';
import '@ant-design/v5-patch-for-react-19';
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';
import { logout, setAuthStatus } from './store/Slices/authSlice.js';
import GroupTrackingLayout from './GroupTrackingLayout.jsx';
import GroupDetails from './components/Pages/GroupTracking/GroupDetails.jsx';
import AddGroup from './components/Pages/GroupTracking/AddGroup.jsx'


unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* Public routes */}
      <Route
        path=""
        element={
          <AuthLayout authentication={false}>
            <Home />
          </AuthLayout>
        }
      />
      <Route
        path="about"
        element={
          <AuthLayout authentication={false}>
            <About />
          </AuthLayout>
        }
      />
      <Route
        path="contact"
        element={
          <AuthLayout authentication={false}>
            <Contact />
          </AuthLayout>
        }
      />
      <Route
        path="feedback"
        element={
          <AuthLayout authentication={false}>
            <FeedBack />
          </AuthLayout>
        }
      />



    </Route>

  )
);

const loggedinRouter = createBrowserRouter(
  createRoutesFromElements(

    <>
      <Route path='/' element={<LoggedinLayout />}>
        <Route
          path="/"
          element={
            <AuthLayout authentication>
              <Habits />
            </AuthLayout>
          }
        />

        <Route
          path="habits"
          element={
            <AuthLayout authentication>
              <Habits />
            </AuthLayout>
          }
        />
        <Route
          path="todayhabits"
          element={
            <AuthLayout authentication>
              <TodayHabits />
            </AuthLayout>
          }
        />
        <Route
          path="grouptracking"
          element={
            <AuthLayout authentication>
              <GroupTrackingLayout /> {/* <Outlet /> will go here */}
            </AuthLayout>
          }
        >
          <Route index element={<GroupTracking />} />        {/* Renders at /grouptracking */}
          <Route path=":groupId" element={<GroupDetails />} /> {/* Renders at /grouptracking/:groupId */}
          <Route path="today/viewtodayhabits" element={<ViewTodayGroupHabits />} /> {/* Renders at /grouptracking/today/viewtodayhabits */}
          <Route path="viewinvites" element={<ViewInvitations />} /> {/* Renders at /grouptracking/viewinvites */}
        </Route>

        <Route
          path="dashboard"
          element={
            <AuthLayout authentication>
              <Dashboard />
            </AuthLayout>
          }
        />
        <Route
          path="about"
          element={
            <AuthLayout authentication>
              <About />
            </AuthLayout>
          }
        />
        <Route
          path="contact"
          element={
            <AuthLayout authentication>
              <Contact />
            </AuthLayout>
          }
        />
        <Route
          path="feedback"
          element={
            <AuthLayout authentication>
              <FeedBack />
            </AuthLayout>
          }
        />
        <Route
          path="profile"
          element={
            <AuthLayout authentication>
              <Profile />
            </AuthLayout>
          }
        />
      </Route>

      <Route
        path='viewhabit'
        element={
          <AuthLayout authentication>
            <ViewHabit />
          </AuthLayout>
        }
      />
      <Route
        path='viewhabit/:habitId'
        element={
          <AuthLayout authentication>
            <ViewHabit />
          </AuthLayout>
        }
      />

    </>

  )
);




function App() {
  const authStatus = useSelector(state => state.auth.authStatus);
  const [routerKey, setRouterKey] = useState(0);
  const storedAuthStatus = useSelector(state => state.auth.authStatus);

  const dispatch = useDispatch();

  // check the authStatus of the user:
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const checkAuth = () => {
      const accessToken = getCookie('accessToken');
      const refreshToken = getCookie('refreshToken');


      // Sync Redux state with cookies and localStorage
      if (accessToken && refreshToken) {
        if (!storedAuthStatus) {
          // localStorage.setItem('authStatus', 'true');
          dispatch(setAuthStatus(true));
        }
      } else {
        if (storedAuthStatus) {
          dispatch(logout());
        }
      }
    };

    checkAuth();
  }, [dispatch]); // Add dispatch to dependency array

  // change the routers as per the user's authStatus:
  useEffect(() => {
    setRouterKey(prevKey => prevKey + 1);
  }, [authStatus]);



  // theme context:
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme); // ✅ Use updated value
  };


 useEffect(() => {
  const html = document.querySelector('html');
  html.classList.remove('light', 'dark');
  html.classList.add(theme);
}, [theme]);

  /// modal conext:
  const [modal, setModal] = useState({ type: null, props: {} });

  // opening the modal means giving any type to it:
  const openModal = (type, props = {}) => {
    setModal({ type, props });
  };


  // closing the modal means setting its type to null:
  const closeModal = () => {
    setModal({ type: null, props: {} });
  };

  // message context:
  const [messageType, setMessageType] = useState(null);
  const [messageContent, setMessageContent] = useState(null);

  const displayMessage = (type, content) => {
    // closeModal(); // close all modals if anyone is open.
    setMessageType(type);
    setMessageContent(content);
  }

  return (
    <MessageProvider value={{ messageType, messageContent, displayMessage }}>
      <ThemeProvider value={{ theme, toggleTheme }}>
        <ModalProvider value={{ openModal, closeModal, modalType: modal.type }}>
          <RouterProvider key={routerKey} router={authStatus ? loggedinRouter : router} />
          <Message /> {/* Render the Message component to show messages */}
          <ModalWindow>
            {modal.type === "authModalSignup" && <AuthTabs defaultWidnow="signup" />}
            {modal.type === "authModalLogin" && <AuthTabs defaultWidnow="login" />}
            {modal.type === "addHabitModal" && <AddHabit />}
            {modal.type === "editHabitModal" && (
              <EditHabit habitId={modal.props.habitId} />
            )}
            {modal.type === "editProfileModal" && (
              <EditProfile userId={modal.props.userId} />
            )}
            {modal.type === "addGroupModal" && (
              <AddGroup />
            )}
            {modal.type === "InviteUsersModal" && (
              <InviteUsers groupId={modal.props.groupId} />
            )}
          </ModalWindow>
        </ModalProvider>
      </ThemeProvider>
    </MessageProvider>
  );
}

export default App;