import { Breadcrumb } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog, LeaderBoard, VerticalBarChart } from '../../index.js';
import { MdOutlineCalendarMonth, MdGroups, MdDescription, MdSportsScore, MdMessage, MdSend } from 'react-icons/md';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useMessage, useModal } from '../../../context/index.js';
import { formatDate } from '../../../../../shared/functions/index.js';
import { useDispatch, useSelector } from 'react-redux';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import { deleteGroup as deleteGroupSlice } from '../../../store/Slices/groupSlice.js';


function GroupDetails() {


  const { groupId } = useParams();
  const { displayMessage } = useMessage();
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(false);
  const { openModal } = useModal();
  // console.log(groupId)
  const [groupName, setGroupName] = useState("Group");
  const [groupDesc, setGroupDesc] = useState("Group Description");
  const [habitName, setHabitName] = useState("Habit");
  // const [habitDesc, setHabitDesc] = useState("Habit Description");
  const [startDate, setStartDate] = useState("startDate");
  const [endDate, setEndDate] = useState("endDate");
  const [admin, setAdmin] = useState({
    email: "",
    fullName: "",
    username: "",
    _id: "",
  })
  const [users, setUsers] = useState([]);
  const [habitData, setHabitData] = useState(null);
  const userID = useSelector(state => state.auth.userData?._id);
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.userData);

  // messages:
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome everyone to our DSA challenge group!",
      sender: "admin",
      timestamp: "2023-05-15T10:30:00Z",
      senderName: "Admin User"
    },
    {
      id: 2,
      text: "Remember to log your progress daily",
      sender: "admin",
      timestamp: "2023-05-16T09:15:00Z",
      senderName: "Admin User"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");


  const [isDialogOpen, setIsDialogOpen] = useState(false); // to handle delete dialog
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // In a real app, you would send this to your backend
    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "admin",
      timestamp: new Date().toISOString(),
      senderName: "You" // Or use admin's name from state
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Here you would typically make an API call to save the message
    // axios.post('/api/group/messages', { groupId, message })
  };


  const handleRemoveUser = async (userId) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/removeuser`, { groupId, userId }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      })

      setUsers(users.filter(user => user.user !== userId));
      setHabitData({ ...habitData, users: users.filter(user => user.user !== userId) });

      displayMessage("success", response.data.message || "User removed successfully");
    } catch (error) {
      console.log(error);
      displayMessage("error", "Error removing user");
    }
  }




  const handleDeleteGroup = async () => {
    try {
      const isUserAdmin = userID == admin._id;
      let response;
      // const requestType = (userID == admin._id) ? "delete" : "patch"

      if (isUserAdmin) {
        response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL_GROUPS}/deletegroup`, {
          data: { groupId },
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });
      }

      else {
        response = await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL_GROUPS}/leavegroup`,
          { groupId }, // data payload
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          }
        );
      }

      displayMessage("success", response.data.message);
      navigate("/grouptracking");
    } catch (error) {
      console.log(error);
      displayMessage("error", "Network Error");
    }
  }


  const handleConfirm = async (deleteId) => {
    try {
      setButtonLoading(true);
      await handleDeleteGroup(deleteId);
      dispatch(deleteGroupSlice(deleteId));
      setIsDialogOpen(false); // Only close on success
    } catch (error) {
      console.error("Error deleting Group:", error);
      displayMessage("error", "Network Error");
    } finally {
      setButtonLoading(false);
    }
  };

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



  // fetch data on page load:
  useEffect(() => {
    ; (
      async function getUsers() {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL_GROUPS}/getusers?groupId=${groupId}`,
            {
              withCredentials: true,
            }
          );


          // console.log(response.data)
          const group = response.data.data.group;
          const habit = response.data.data.groupHabit;
          const usersData = response.data.data.users;
          // console.log(group);
          // console.log(usersData);
          setUsers(usersData);
          setGroupName(group.groupName);
          setGroupDesc(group.groupDesc);
          setAdmin(group.admin);
          setHabitName(habit.habitName);
          setStartDate(habit.startDate);
          setEndDate(habit.endDate);
          setHabitData({ habitName: habit.habitName, users: usersData })
        } catch (error) {
          console.log("Error fetching group details and users:", error);
          displayMessage("error", "Network Error or Invalid Group");
          navigate("/grouptracking");

        }
      }

    )()
  }, [])

  const items = [
    {
      title: 'Group Tracking',
      path: '/grouptracking',
    },
    {
      title: `Group Details: ${groupName}`,
    }
  ];

  return (
    <div className="min-h-screen pb-8 w-full bg-color-background dark:bg-color-dark-background">
      {/* Compact Hero Section */}
      <div
        className="w-full py-6 px-4 md:px-6 relative overflow-hidden"
        style={{ background: 'var(--color-gradient)' }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <Breadcrumb
            className="my-4"
            itemRender={(route) =>
              route.path ? (
                <Link to={route.path} className="text-on-primary/90 hover:text-on-primary hover:underline transition-colors">
                  {route.title}
                </Link>
              ) : (
                <span className="text-on-primary font-medium">{route.title}</span>
              )
            }
            items={items}
          />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-xl my-3 md:text-2xl font-bold text-on-primary mb-1">
                {groupName}
              </h1>
              <div className="bg-on-primary/10 rounded-full my-3 px-3 py-1 inline-flex items-center">
                <span className="text-on-primary/90 text-sm font-medium">
                  {habitName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-on-primary/10 rounded-full px-3 py-1 text-on-primary/90 text-sm">
              <MdOutlineCalendarMonth size={16} />
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
        {/* Group Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 dark:bg-color-dark-primary/10 rounded-lg text-primary dark:text-color-dark-primary">
              <MdDescription size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-2">About this Group</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {groupDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* LeaderBoard - Full width */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 dark:bg-color-dark-primary/10 rounded-md text-primary dark:text-color-dark-primary">
                  <MdSportsScore size={18} />
                </div>
                <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  Member Rankings
                </h2>
              </div>
              {habitData?.users?.length > 0 && <LeaderBoard habitData={habitData} groupId={groupId} />}
            </section>

            {/* Chart - Full width and lower height */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 dark:bg-color-dark-primary/10 rounded-md text-primary dark:text-color-dark-primary">
                  <MdGroups size={18} />
                </div>
                <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  Group Progress
                </h2>
              </div>
              <div className="h-auto"> {/* Adjustable height */}
                <VerticalBarChart title="Progress Overview" data={habitData && habitData.users} />
              </div>
            </section>
          </div>

          {/* Sidebar - Full width on mobile, 1/3 on desktop */}
          <div className="space-y-6">
            {/* {console.log(users)} */}
            {/* Members Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base text-gray-800 dark:text-gray-200">
                  Group Members
                </h2>
                <span className="bg-primary/10 dark:bg-color-dark-primary/10 text-primary dark:text-color-dark-primary px-2 py-0.5 rounded-full text-xs font-medium">
                  {habitData && habitData.users.length} / 5
                </span>
              </div>
              <div className="space-y-3">
                {
                  users && users.length > 0 ? users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      {/* Profile Image or Initials */}
                      {
                        user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 flex items-center justify-center text-xs font-semibold uppercase flex-shrink-0">
                            {getInitials(user.fullName)}
                          </div>
                        )
                      }

                      {/* User Info */}
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate flex items-center gap-2">
                          {user.fullName}
                          {
                            user.user === admin._id && (
                              <span className="bg-primary/10 dark:bg-color-dark-primary/10 text-primary dark:text-color-dark-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                Admin
                              </span>
                            )
                          }
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">@{user.username}</p>
                      </div>

                      {/* Remove Icon */}
                      {
                        userData._id === admin._id && user.user !== admin._id && (
                          <button
                            onClick={() => handleRemoveUser(user.user)}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors ml-2"
                            aria-label={`Remove ${user.fullName}`}
                          >
                            <IoIosRemoveCircleOutline size={20} />
                          </button>
                        )
                      }
                    </div>
                  )) : (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No members yet.</p>
                  )
                }
              </div>

              {/* // keep the button disabled if userId matches adminId */}
              <button className={`w-full mt-3 py-1.5 px-3 bg-primary/10 dark:bg-color-dark-primary/10 hover:bg-primary/20 dark:hover:bg-color-dark-primary/20 text-primary dark:text-color-dark-primary rounded-lg text-sm font-medium transition-colors
                
                ${userID !== admin._id || users.length >= 5 ? 'cursor-not-allowed opacity-50' : ''}
                
                
                `}
                onClick={() => openModal("InviteUsersModal", { groupId })}

              >
                Invite Members
              </button>
            </section>
            {/* Admin Messages Section */}

            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <MdMessage size={18} />
                Group Announcements
              </h2>
              <div className="space-y-4">
                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send message to group..."
                    className={`flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-700 dark:text-gray-200 ${userID !== admin._id ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`p-2 bg-primary/10 dark:bg-color-dark-primary/10 hover:bg-primary/20 dark:hover:bg-color-dark-primary/20 text-primary dark:text-color-dark-primary rounded-lg transition-colors ${userID !== admin._id ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <MdSend size={18} />
                  </button>
                </div>

                {/* Messages List */}
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          {message.senderName}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(message.timestamp, true)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {message.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>


            {/* Leave Group Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-3">
                {userID == admin._id ? "Delete Group" : "Leave Group"}
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <ConfirmDialog
                  openStatus={isDialogOpen}
                  onClose={() => setIsDialogOpen(false)}
                  onConfirm={() => handleConfirm(groupId)}
                  title={userID == admin._id ? "Delete this group?" : "Leave this group?"}
                  description="This will permanently delete the group from your profile."
                  confirmText="Delete"
                  cancelText="Cancel"
                  buttonLoading={buttonLoading}
                />

                <button className="w-full py-1.5 px-3 bg-primary/10 dark:bg-color-dark-primary/10 hover:bg-primary/20 dark:hover:bg-color-dark-primary/20 text-primary dark:text-color-dark-primary rounded-lg text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(true);
                  }}
                >
                  {userID == admin._id ? "Delete Group" : "Leave Group"}
                </button>

              </div>

            </section>


          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;