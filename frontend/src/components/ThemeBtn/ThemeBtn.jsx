import React from 'react'
import { useTheme } from '../../context';


function ThemeBtn() {
    const {theme, toggleTheme} = useTheme();

    const changeTheme = () => {
        toggleTheme();
    }
  return (
    <div>
      <button onClick={changeTheme}>Change Theme</button>
    </div>
  )
}

export default ThemeBtn
