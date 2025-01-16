import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { FontAwesome, Entypo, AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import colors from "../../config/colors";

export default function Settings({ navigation }: { navigation: any }) {
  const [userDisplayName, setUserDisplayName] = useState(
    auth.currentUser?.displayName || "User"
  );

  const onSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            signOut(auth).catch((error) =>
              console.log("Error logging out: ", error)
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDisplayName(user.displayName || "User");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={
            auth.currentUser?.photoURL
              ? { uri: auth.currentUser.photoURL }
              : require("../../assets/images/default-profile-picture.jpg")
          }
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>@{userDisplayName}</Text>
      </View>

      <View style={styles.optionsList}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("UpdateAvatar")}
        >
          <FontAwesome name="user-circle" size={24} color={colors.primary} />
          <Text style={styles.optionText}>Change Avatar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("UpdateUsername")}
        >
          <Entypo name="edit" size={24} color={colors.primary} />
          <Text style={styles.optionText}>Edit Username</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.floatingButton}>
        <TouchableOpacity onPress={onSignOut} style={styles.logoutButton}>
          <AntDesign name="logout" size={24} color={colors.dangerContrast} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  optionsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    marginLeft: 15,
    fontSize: 18,
    color: colors.textPrimary,
  },
  floatingButton: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 30,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
});
