import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from 'expo-constants';

const firebaseConfig = { 
    apiKey: "AIzaSyAH7eAzvYe4BklPA7gV5nmCIFch9XMvI3k",
    authDomain: "messageapp-2ede5.firebaseapp.com",
    projectId: "messageapp-2ede5",
    storageBucket: "messageapp-2ede5.firebasestorage.app",
    messagingSenderId: "34889444995",
    appId: "1:34889444995:web:203d8ee6863a8e1d8735b6",
    measurementId: "G-Z5Q65CSN9Q"
}

initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();