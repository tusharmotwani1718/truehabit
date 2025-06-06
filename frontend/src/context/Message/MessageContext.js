import React from "react";

const MessageContext = React.createContext({
    messgeType: null,
    messageContent: null,
    displayMessage: (type, content) => { }
})

export const MessageProvider = MessageContext.Provider;

export default function useMessage() {
    return React.useContext(MessageContext);
}