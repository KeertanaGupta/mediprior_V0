// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Helper function to get the saved theme
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    // Default to 'dark' if no theme is saved
    return savedTheme ? savedTheme : 'dark';
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme); // Save the choice
            return newTheme;
        });
    };

    // 2. This is the magic:
    // This effect runs when 'theme' changes and sets an attribute on the <html> tag
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 3. Custom hook to easily use the context
export const useTheme = () => {
    return useContext(ThemeContext);
};