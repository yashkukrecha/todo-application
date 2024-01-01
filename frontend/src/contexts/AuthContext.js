// Importing necessary hooks and functionalities
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Creating a context for authentication. Contexts provide a way to pass data through 
// the component tree without having to pass props down manually at every level.
const AuthContext = createContext();

const firebaseConfig = {
    apiKey: "AIzaSyAlvVBxWV7e32cxdL1mCDeCG8cKVnXoHx0",
    authDomain: "todo-app-db-da21e.firebaseapp.com",
    projectId: "todo-app-db-da21e",
    storageBucket: "todo-app-db-da21e.appspot.com",
    messagingSenderId: "100373269739",
    appId: "1:100373269739:web:554f087940f6035cc582ae",
    measurementId: "G-RTFWED8V5G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// This is a custom hook that we'll use to easily access our authentication context from other components.
export const useAuth = () => {
    return useContext(AuthContext);    
};

// This is our authentication provider component.
// It uses the context to provide authentication-related data and functions to its children components.
export function AuthProvider({ children }) {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loginError, setLoginError] = useState(null);
    
    // Login function that validates the provided username and password.
    const login = (email, password) => {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            setUser(userCredential.user);
            // this method of retrieving access token also works
            // console.log(userCredential.user.accessToken)
            navigate("/");
          })
          .catch((error) => {
            setLoginError(error.message);
          });
      };

    // Logout function to clear user data and redirect to the login page.
    const logout = () => {
        auth.signOut().then(() => {
          setUser(null);
          navigate("/login");
        });
    };

    // Register function
    const register = (email, password) => {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            setUser(userCredential.user);
            // correct and formal way of getting access token
            // userCredential.user.getIdToken().then((accessToken) => {
            //     console.log(accessToken)
            // })
            navigate("/");
          })
          .catch((error) => {
            setLoginError(error.message);
          });
    };

    // An object containing our state and functions related to authentication.
    // By using this context, child components can easily access and use these without prop drilling.
    const contextValue = {
        user, 
        loginError,
        login, 
        logout,
        register
    };

    // The AuthProvider component uses the AuthContext.Provider to wrap its children.
    // This makes the contextValue available to all children and grandchildren.
    // Instead of manually passing down data and functions, components inside this provider can
    // simply use the useAuth() hook to access anything they need.
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}