import React, { useState, createContext, useContext, useEffect } from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { RootStackParamList } from "./types";
import { auth } from "@/config/firebase";
import colors from "@/config/colors";
import { Entypo } from "@expo/vector-icons";

import Chat from "./msg/chat";
import Login from "./auths/login";
import Signup from "./auths/signup";
import Home from "./index";
import Contacts from "./msg/contacts";

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
      screenOptions={{ headerShown: true }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen
        name="Contacts"
        component={Contacts}
        options={{
          title: "Contacts",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerSearchBarOptions: { placeholder: "Search" },
        }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          title: "",
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingBottom: 4,
              }}
            >
              <Image
                source={{
                  uri: "https://i.pravatar.cc/150?u=ceciliaduke@marketoid.com",
                }}
                style={{ width: 40, height: 40, borderRadius: 50 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>Simon</Text>
            </View>
          ),
        }}
      />
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
