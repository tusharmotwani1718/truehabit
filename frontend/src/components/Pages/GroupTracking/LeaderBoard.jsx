import React, { useState, useEffect } from 'react';
import { MdEmojiEvents, MdOutlineExpandMore, MdWorkspacePremium } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';

const LeaderBoard = ({ habitData, groupId }) => {
  const [sortedUsers, setSortedUsers] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();

  
  
  useEffect(() => {
    // Sort users by completion rate (decreasing order)
    if (habitData && habitData.users) {
      const sorted = [...habitData.users].sort((a, b) => b.completionRate - a.completionRate);
      setSortedUsers(sorted);
    }
  }, [habitData]);

  // Display limit: show top 5 by default, show all when expanded
  const displayUsers = showAll ? sortedUsers : sortedUsers.slice(0, 5);
  
  // Get position style based on ranking
  const getPositionStyle = (index) => {
    if (index === 0) return 'text-amber-500 dark:text-amber-400';
    if (index === 1) return 'text-gray-500 dark:text-gray-300';
    if (index === 2) return 'text-amber-700 dark:text-amber-600';
    return 'text-neutral dark:text-dark-neutral';
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

  // Get background style for each row
  const getRowBackground = (index) => {
    if (index === 0) return 'bg-primary/10 dark:bg-dark-primary/10';
    if (index % 2 === 0) return 'bg-primary/5 dark:bg-dark-primary/5';
    return 'bg-on-primary dark:bg-dark-background';
  };

  return (
    <div className="w-full mx-auto overflow-hidden rounded-xl shadow-lg border border-neutral/10 dark:border-dark-neutral/10">
      {/* Header with gradient background */}
      <div 
        className="p-6 text-on-primary dark:text-dark-on-primary"
        style={{ background: 'var(--color-gradient)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-on-primary/20 dark:bg-dark-on-primary/20 p-2.5 rounded-xl">
              <MdEmojiEvents className="text-custom-lg md:text-custom-xl" />
            </div>
            <div>
              <h2 className="text-custom-lg md:text-custom-xl font-bold">
                Leaderboard
              </h2>
              <p className="text-custom-sm text-on-primary/80 dark:text-dark-on-primary/80">
                {habitData?.habitName ? `${habitData.habitName}` : 'Habit'} completion rankings
              </p>
            </div>
          </div>
          <div className="hidden md:block text-on-primary/80 dark:text-dark-on-primary/80 bg-on-primary/10 dark:bg-dark-on-primary/10 px-4 py-2 rounded-full text-custom-sm">
            {sortedUsers.length} {sortedUsers.length === 1 ? 'Participant' : 'Participants'}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 py-4 px-6 bg-primary/5 dark:bg-dark-primary/5 border-b border-neutral/10 dark:border-dark-neutral/10">
        <div className="col-span-1 text-primary dark:text-dark-primary font-medium text-custom-sm">#</div>
        <div className="col-span-7 md:col-span-8 text-primary dark:text-dark-primary font-medium text-custom-sm">User</div>
        <div className="col-span-4 md:col-span-3 text-primary dark:text-dark-primary font-medium text-custom-sm text-right">Completion</div>
      </div>

      {/* User List */}
      <div className="divide-y divide-neutral/5 dark:divide-dark-neutral/5">
        {displayUsers.length > 0 ? (
          displayUsers.map((user, index) => (
            <div 
              key={user._id || index}
              onClick={() => navigate(`/viewhabit?groupId=${groupId}&userId=${user.user}`)}
              className={`grid grid-cols-12 items-center py-4 px-6 ${getRowBackground(index)} hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors duration-300 group`}
            >
              {/* Position */}
              <div className="col-span-1 font-semibold">
                <span className={`${getPositionStyle(index)}`}>{index + 1}</span>
              </div>
              
              {/* User Info */}
              <div className="col-span-7 md:col-span-8 flex md:items-center gap-4 flex-col items-start md:flex-row">
                <div className="relative">
                  {user.profileImage ? (
                    <div className="relative">
                      <img 
                        src={user.profileImage} 
                        alt={user.fullName} 
                        className={`w-12 h-12 rounded-full object-cover border-2 ${index === 0 ? 'border-amber-500 dark:border-amber-400' : 'border-primary/20 dark:border-dark-primary/20'}`}
                      />
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-on-primary dark:text-dark-on-primary p-1 rounded-full shadow-md">
                          <MdWorkspacePremium size={16} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-on-primary dark:text-dark-on-primary ${
                        index === 0 ? 'bg-primary dark:bg-dark-primary' : 'bg-primary/30 dark:bg-dark-primary/30'
                      }`}>
                        {getInitials(user.fullName)}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-on-primary dark:text-dark-on-primary p-1 rounded-full shadow-md">
                          <MdWorkspacePremium size={16} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className={`font-medium text-onBackgorund dark:text-dark-onBackground ${index === 0 ? 'font-bold' : ''}`}>
                    {user.fullName}
                  </p>
                  <p className="text-primary dark:text-dark-primary text-custom-sm">
                    @{user.username}
                  </p>
                </div>
              </div>
              
              {/* Completion Rate */}
              <div className="col-span-4 md:col-span-3">
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`text-custom-md font-bold ${getPositionStyle(index)}`}>
                    {user.completionRate}%
                  </div>
                  <div className="w-full md:w-32 bg-neutral/20 dark:bg-dark-neutral/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        index === 0 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-primary dark:bg-dark-primary'
                      }`}
                      style={{ width: `${user.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 px-6 text-center text-neutral dark:text-dark-neutral">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 dark:bg-dark-primary/10">
                <MdEmojiEvents size={32} className="text-primary dark:text-dark-primary opacity-60" />
              </div>
              <p>No participants data available yet</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Show More/Less Button */}
      {sortedUsers.length > 5 && (
        <div className="p-6 bg-on-primary dark:bg-dark-background border-t border-neutral/10 dark:border-dark-neutral/10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-3 px-4 rounded-xl bg-primary dark:bg-dark-primary text-on-primary dark:text-dark-on-primary font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{showAll ? 'Show Less' : `Show All ${sortedUsers.length} Users`}</span>
            <MdOutlineExpandMore className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};

LeaderBoard.propTypes = {
  habitData: PropTypes.shape({
    habitName: PropTypes.string,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        fullName: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        profileImage: PropTypes.string,
        completionRate: PropTypes.number.isRequired
      })
    )
  }).isRequired
};

export default LeaderBoard;