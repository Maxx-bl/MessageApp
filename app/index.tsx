import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import colors from "../config/colors";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home({ navigation }: { navigation: any }) {
  const [userDisplayName, setUserDisplayName] = useState(
    auth.currentUser?.displayName
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDisplayName(user.displayName);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            auth.currentUser?.photoURL
              ? { uri: auth.currentUser.photoURL }
              : require("../assets/images/default-profile-picture.jpg")
          }
          style={{ width: 60, height: 60, borderRadius: 30 }}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: -20,
            color: colors.textPrimary,
          }}
        >
          {userDisplayName ? `@${userDisplayName}` : "Welcome!"}
        </Text>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.navigate("Settings")}
        >
          <AntDesign
            name="setting"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.floatingButton}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Contacts")}
          style={styles.contactButton}
        >
          <Entypo name="chat" size={24} color={colors.lightGray} />
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.background,
    elevation: 5,
  },
  contactButton: {
    backgroundColor: colors.primary,
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    marginRight: 20,
    marginBottom: 50,
  },
  floatingButton: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
});
