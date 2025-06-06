import React, { useEffect } from 'react';
import { message } from 'antd';
import { useMessage } from '../context';


const Message = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const { messageType, messageContent, displayMessage } = useMessage();


    useEffect(() => {
        if (messageType !== null && messageContent !== null) {
            messageApi.open({
                type: messageType,
                content: messageContent,
            });
            
            displayMessage(null, null)
        }
    }, [messageType, messageContent, messageApi, displayMessage]);

    return <>{contextHolder}</>;
};

export default Message;
