// import { Home, Contact, AuthTabs, Habits, Dashboard, AddHabit, TodayHabits, EditHabit, ViewHabit, GroupTracking, ViewTodayGroupHabits, InviteUsers, ViewInvitations, Profile, EditProfile, VerifyEmail, ComingSoon } from './components/index.js';
import {AuthTabs, AddHabit, EditHabit, ViewHabit, InviteUsers, EditProfile} from './components/index.js';
import Layout from './Layout.jsx';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { MessageProvider, ModalProvider, ThemeProvider, useMessage } from './context/index.js';
import ModalWindow from './ant-design/ModalWindow.jsx';
import Message from './ant-design/Message.jsx';
import { Provider, useDispatch, useSelector } from 'react-redux';
import LoggedinLayout from './LoggedinLayout.jsx';
import { useEffect, useState, lazy } from 'react';
import AuthLayout from './AuthLayout.jsx';
import '@ant-design/v5-patch-for-react-19';
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';
// import { logout, setAuthStatus } from './store/Slices/authSlice.js';
import GroupTrackingLayout from './GroupTrackingLayout.jsx';
import GroupDetails from './components/Pages/GroupTracking/GroupDetails.jsx';
import AddGroup from './components/Pages/GroupTracking/AddGroup.jsx'
import NotFound from './components/utils/NotFound.jsx';
import AuthProvider from './AuthProvider.jsx';

// Lazy loads:
const Home = lazy(() => import('./components/index.js').then(m => ({ default: m.Home })));
const Contact = lazy(() => import('./components/index.js').then(m => ({ default: m.Contact })));
const Profile = lazy(() => import('./components/index.js').then(m => ({ default: m.Profile })));
const VerifyEmail = lazy(() => import('./components/index.js').then(m => ({ default: m.VerifyEmail })));

const Habits = lazy(() => import('./components/index.js').then(m => ({ default: m.Habits })));
const TodayHabits = lazy(() => import('./components/index.js').then(m => ({ default: m.TodayHabits })));
// const GroupTrackingLayout = lazy(() => import('./components/index.js').then(m => ({ default: m.GroupTrackingLayout })));
const GroupTracking = lazy(() => import('./components/index.js').then(m => ({ default: m.GroupTracking })));
// const GroupDetails = lazy(() => import('./components/index.js').then(m => ({ default: m.GroupDetails })));
const ViewTodayGroupHabits = lazy(() => import('./components/index.js').then(m => ({ default: m.ViewTodayGroupHabits })));
const ViewInvitations = lazy(() => import('./components/index.js').then(m => ({ default: m.ViewInvitations })));
const Dashboard = lazy(() => import('./components/index.js').then(m => ({ default: m.Dashboard })));







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
        path="contact"
        element={
          <AuthLayout authentication={false}>
            <Contact />
          </AuthLayout>
        }
      />
      <Route
        path="profile"
        element={
          <AuthLayout authentication={false}>
            <Profile />
          </AuthLayout>
        }
      />
      <Route
        path="verify-email"
        element={
          <AuthLayout authentication={false}>
            <VerifyEmail />
          </AuthLayout>
        }
      />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />



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
              {/* <ComingSoon /> */}
            </AuthLayout>
          }
        >
          <Route index element={<GroupTracking />} />        Renders at /grouptracking
          <Route path=":groupId" element={<GroupDetails />} /> Renders at /grouptracking/:groupId
          <Route path="today/viewtodayhabits" element={<ViewTodayGroupHabits />} /> Renders at /grouptracking/today/viewtodayhabits
          <Route path="viewinvites" element={<ViewInvitations />} /> Renders at /grouptracking/viewinvites
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
          path="verify-email"
          element={
            <AuthLayout authentication>
              <VerifyEmail />
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
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />

    </>

  )
);




function App() {
  const authStatus = useSelector(state => state.auth.authStatus);
  const [routerKey, setRouterKey] = useState(0);

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
          <AuthProvider>   {/* Add this here */}
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
          </AuthProvider>
        </ModalProvider>
      </ThemeProvider>
    </MessageProvider>
  );
}

export default App;