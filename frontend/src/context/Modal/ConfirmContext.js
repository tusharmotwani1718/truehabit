import React from "react";

// creating the context:
const ConfirmContext = React.createContext({
    confirmType: null, // confirmType is defined to make the window use for multiple modals...
    openConfirm: (confirmType, confirmTitle, confirmDesc, confirmIcon) => {},
    closeConfirm: () => {}
});

// providing the context:
export const ConfirmProvider = ConfirmContext.Provider;

// custom hook/function to use the context:
export default function useConfirm() {
    return React.useContext(ConfirmContext);
}