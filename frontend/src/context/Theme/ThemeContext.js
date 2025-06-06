import React from "react";

// creating the context:
const ThemeContext = React.createContext({
    theme: localStorage.getItem("theme") || "light",
    toggleTheme: () => {},
});

// providing the context:
export const ThemeProvider = ThemeContext.Provider;

// custom hook/function to use the context:
export default function useTheme() {
    return React.useContext(ThemeContext);
}