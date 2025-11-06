// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// 1. Get tokens from storage immediately when the app loads.
const getTokensFromStorage = () => {
    const tokens = localStorage.getItem('access_token');
    try {
        if (tokens) {
            return JSON.parse(tokens);
        }
    } catch (e) {
        console.error("Could not parse tokens from storage", e);
        localStorage.removeItem('access_token'); // Clear corrupted token
    }
    return null;
};

// 2. Set the axios default header immediately (top-level).
const initialAuthTokens = getTokensFromStorage();
if (initialAuthTokens) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialAuthTokens.access}`;
}
// --- END OF FIX ---

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 3. Use the tokens we already fetched for the initial state.
    const [authTokens, setAuthTokens] = useState(initialAuthTokens);
    
    const [user, setUser] = useState(() => 
        initialAuthTokens
        ? jwtDecode(initialAuthTokens.access)
        : null
    );

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = (path) => {
        window.location.href = path;
    };

    // This function can be called by any component to refresh the profile
    const fetchProfile = async () => {
        const tokens = getTokensFromStorage(); // Get fresh tokens
        if (!tokens) {
            setLoading(false);
            return 'error';
        }
        
        // This check is a safeguard
        if(!axios.defaults.headers.common['Authorization']){
             axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        }

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/profile/');
            setProfile(response.data);
            return 'success';
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setProfile(null); 
                return 'not_found';
            } else {
                console.error('Fetch profile error', error);
                return 'error';
            }
        }
    };

    // --- Login Function ---
    const loginUser = async (email, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                email: email,
                password: password
            });
            const data = response.data;
            const decodedUser = jwtDecode(data.access);

            setAuthTokens(data);
            setUser(decodedUser);
            localStorage.setItem('access_token', JSON.stringify(data));
            // Set the default header for this new session
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            
            navigate('/dashboard'); // Just navigate. Dashboard will handle the rest.
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
        // Un-set the default header
        axios.defaults.headers.common['Authorization'] = null;
        navigate('/login');
    };

    // This useEffect just loads data on startup
    useEffect(() => {
        const loadData = async () => {
            if (authTokens && !profile) {
                await fetchProfile(); // Load profile if we're logged in
            }
            setLoading(false);
        }
        loadData();
    }, []); // Run only ONCE on initial app load


    const contextData = {
        user: user,
        profile: profile,
        authTokens: authTokens, // <-- THIS IS THE VALUE THAT WAS 'undefined'
        fetchProfile: fetchProfile, 
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        // --- THIS IS THE TYPO THAT WAS LIKELY CAUSING THE CRASH ---
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider> 
    );
};

// This is a custom hook to easily use the context
export const useAuth = () => {
    return useContext(AuthContext);
};