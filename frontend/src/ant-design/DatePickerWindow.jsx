import React from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';


function DatePickerWindow({
  placeholder = "Select Date",
  label = "Date",
  className = "",
  ...props
}) {

  const minDate = dayjs(); // today date
  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };

  return (
    <div className='flex flex-col gap-2 my-4'>
      <label>{label}</label>
      <DatePicker onChange={onChange} needConfirm placeholder={placeholder} className={`${className}`}
        disabledDate={(current) => current && current < minDate.startOf('day')}
        {...props}
      />
    </div>
  )
}

export default DatePickerWindow
