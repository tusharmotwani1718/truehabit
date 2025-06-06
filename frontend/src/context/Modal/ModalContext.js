import React from "react";

// creating the context:
const ModalContext = React.createContext({
    modalType: null, // modalType is defined to make the window use for multiple modals...
    openModal: (modalType) => {},
    closeModal: () => {}
});

// providing the context:
export const ModalProvider = ModalContext.Provider;

// custom hook/function to use the context:
export default function useModal() {
    return React.useContext(ModalContext);
}