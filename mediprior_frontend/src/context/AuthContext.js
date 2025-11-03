// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // This state holds the user's tokens
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('access_token') 
        ? JSON.parse(localStorage.getItem('access_token')) 
        : null
    );
    
    // This state holds the decoded user info (like email, user_type)
    const [user, setUser] = useState(() => 
        localStorage.getItem('access_token') 
        ? jwtDecode(JSON.parse(localStorage.getItem('access_token')).access)
        : null
    );

    // This state will hold the Patient or Doctor profile details
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to navigate (we need this for login/logout)
    const navigate = (path) => {
        window.location.href = path;
    };

    // --- Fetch Profile Function ---
    // This function gets the profile and saves it to state.
    // It's called by the dashboard and on initial load.
    const fetchProfile = async () => {
        const tokens = localStorage.getItem('access_token') 
            ? JSON.parse(localStorage.getItem('access_token')) 
            : null;

        if (!tokens) {
            setLoading(false);
            return 'error'; // No tokens, can't fetch
        }

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            setProfile(response.data); // Save the profile
            return 'success';
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setProfile(null); // Explicitly set profile to null
                return 'not_found'; // Profile is missing
            } else {
                console.error('Fetch profile error', error);
                return 'error';
            }
        }
    };

    // --- Login Function (Final Version) ---
    const loginUser = async (email, password) => {
        try {
            // 1. Get tokens
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                email: email,
                password: password
            });
            const data = response.data;
            const decodedUser = jwtDecode(data.access);

            // 2. Set state and local storage
            setAuthTokens(data);
            setUser(decodedUser); // This line was duplicated in your version
            localStorage.setItem('access_token', JSON.stringify(data));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            
            // 3. This is the new, simple logic.
            // Just go to the dashboard. The dashboard page itself
            // will now handle checking the profile and showing the modal.
            navigate('/dashboard');
            
            return 'success';

        } catch (error) {
            console.error('Login error', error);
            return 'error';
        }
    };

    // --- Logout Function ---
    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        setProfile(null);
        localStorage.removeItem('access_token');
        axios.defaults.headers.common['Authorization'] = null;
        navigate('/login');
    };

    // --- This fixes the infinite loop ---
    // This useEffect now ONLY runs when authTokens changes (like on login).
    // It no longer depends on 'profile', which broke the loop.
    useEffect(() => {
        const loadData = async () => {
            if (authTokens) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
                await fetchProfile(); // Load the profile on startup
            }
            setLoading(false);
        }
        
        loadData();
    }, [authTokens]); // Only depends on authTokens


    const contextData = {
        user: user,
        profile: profile,
        fetchProfile: fetchProfile, // <-- Expose fetchProfile
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// This is a custom hook to easily use the context
export const useAuth = () => {
    return useContext(AuthContext);
};