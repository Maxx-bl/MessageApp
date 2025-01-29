import React, { useState, createContext, useContext, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { RootStackParamList } from "./types";
import { auth } from "@/config/firebase";
import colors from "@/config/colors";

import Chat from "./msg/chat";
import Login from "./auths/login";
import Signup from "./auths/signup";
import Home from "./index";
import Contacts from "./msg/contacts";
import Settings from "./params/settings";
import UpdateAvatar from "./params/updateAvatar";
import UpdateUsername from "./params/updateUsername";
import NewPost from "./update_content/newPost";

const Stack = createStackNavigator<RootStackParamList>();

interface AuthUserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthUserContext = createContext<AuthUserContextType | undefined>(
  undefined
);

const AuthUserProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<any>(null);
  return (
    <AuthUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthUserContext.Provider>
  );
};

function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen name="Settings" component={Settings}></Stack.Screen>
      <Stack.Screen
        name="UpdateAvatar"
        component={UpdateAvatar}
        options={{
          title: "Avatar",
          headerStyle: { backgroundColor: colors.background },
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="UpdateUsername"
        component={UpdateUsername}
        options={{
          title: "Username",
          headerStyle: { backgroundColor: colors.background },
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="Contacts"
        component={Contacts}
        options={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="newPost"
        component={NewPost}
        options={{
          title: "New post",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const authContext = useContext(AuthUserContext);

  if (!authContext) {
    throw new Error("AuthUserContext must be used within an AuthUserProvider");
  }

  const { user, setUser } = authContext;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      authenticatedUser ? setUser(authenticatedUser) : setUser(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <ChatStack /> : <AuthStack />;
}

export default function RootLayout() {
  return (
    <AuthUserProvider>
      <RootNavigator />
    </AuthUserProvider>
  );
}
