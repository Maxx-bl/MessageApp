import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Config from "../settings.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = { 
    apiKey: Config.API_KEY,
    authDomain: Config.AUTH_DOMAIN,
    projectId: Config.PROJECT_ID,
    storageBucket: Config.STORAGE_BUCKET,
    messagingSenderId: Config.MESSAGING_SENDER_ID,
    appId: Config.APP_ID,
    measurementId: Config.MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig);
// export const auth = getAuth();
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore();