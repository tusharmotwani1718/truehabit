import React from 'react'
import TodayHabits from '../Habits/TodayHabits'


function ViewTodayGroupHabits() {
  return (
    <div className='mt-8 w-full md:w-[95%] mx-auto'>
          <h2 className='text-xl font-bold text-primary dark:text-dark-primary mb-4 pl-3 md:pl-16'>Today's Group Habits</h2>
          <div className="rounded-lg shadow-sm" style={{ border: '1px solid rgba(158, 158, 158, 0.2)', width: '90%', margin: '0 auto' }}>
            <TodayHabits topbar={false} fetchGroups={true} />
          </div>
        </div>
  )
}

export default ViewTodayGroupHabits;
