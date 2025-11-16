// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const getTokensFromStorage = () => {
    const tokens = localStorage.getItem('access_token');
    try {
        if (tokens) { return JSON.parse(tokens); }
    } catch (e) {
        localStorage.removeItem('access_token');
    }
    return null;
};

const initialAuthTokens = getTokensFromStorage();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(initialAuthTokens);
    const [user, setUser] = useState(() => initialAuthTokens ? jwtDecode(initialAuthTokens.access) : null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = (path) => { window.location.href = path; };

    // This function can be called by any component to refresh the profile
    const fetchProfile = React.useCallback(async () => {
        const tokens = getTokensFromStorage();
        if (!tokens) {
            setLoading(false);
            return 'error';
        }

        try {
            // Manually add the token
            const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            setProfile(response.data);
            return 'success';
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setProfile(null); 
                return 'not_found';
            } else {
                return 'error';
            }
        }
    },[]);
 
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
            
            navigate('/dashboard'); // Just navigate.
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
        navigate('/login');
    };

    // This useEffect just loads data on startup
    useEffect(() => {
        const loadData = async () => {
            if (authTokens && !profile) {
                await fetchProfile();
            }
            setLoading(false);
        }
        loadData();
    }, [authTokens, profile, fetchProfile]);

    const contextData = {
        user: user,
        profile: profile,
        authTokens: authTokens, // <-- EXPOSE THE TOKENS
        fetchProfile: fetchProfile, 
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        // --- THIS WAS THE TYPO ---
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider> 
        // It used to say </AuthData>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};