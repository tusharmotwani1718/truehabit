import React, { useEffect, useState } from 'react';
import { Avatar, Divider, List, Skeleton } from 'antd';

const CustomList = ({
  title = "Title"
}) => {

  const listUsers = [
    {
      name: "A",
      email: "a@b.com",
      avatar: "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/12.jpg",
      role: "admin",
      completionRate: 50
    },
    {
      name: "B",
      email: "b@b.com",
      avatar: "https://avatars.githubusercontent.com/u/63156927",
      role: "user",
      completionRate: 80
    },
    {
      name: "C",
      email: "c@b.com",
      avatar: "https://avatars.githubusercontent.com/u/98111059",
      role: "user",
      completionRate: 76
    }
  ]


  const [loading, setLoading] = useState(false);


  return (
    <div className='mt-7'>
    <h3 className='font-bold text-lg'>{title}</h3>
    <div
      style={{
        height: 'auto',
        overflow: 'auto',
        padding: '16px',
        border: '1px solid rgba(140, 140, 140, 0.35)',
        maxHeight: "45vh",
        marginTop: "1rem"
      }}
    >
      {loading ? (
        <Skeleton avatar paragraph={{ rows: 1 }} active />
      ) : (
        <List
          dataSource={listUsers}
          renderItem={item => (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={<>
                <span className='text-white font-semibold'>{item.name}</span>
                {
                  item.role === "admin" && 
                  <span className='text-primary dark:text-dark-primary font-semibold ml-2'>(Admin)</span>
                }
                </>
                
              
              }
                description={<span className='text-gray-500'>{item.email}</span>}
                
              />
              <div className='text-gray-500'>Content</div>
            </List.Item>
          )}
        />
      )}
      
    </div>
    </div>
  );
};

export default CustomList;
