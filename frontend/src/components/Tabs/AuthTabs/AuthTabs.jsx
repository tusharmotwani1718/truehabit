import React from 'react';
import { Tabs } from 'antd';
import { LoginForm, SignupForm } from '../..';

const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: 'signup',
    label: 'Signup',
    children: <SignupForm />,
  },
  {
    key: 'login',
    label: 'Login',
    children: <LoginForm />,
  }
];

function AuthTabs({
    defaultWidnow = "signup"
}) {
    // console.log(defaultWidnow);
    
  return (
    <Tabs defaultActiveKey={defaultWidnow} items={items} onChange={onChange} />
  )
}

export default AuthTabs
