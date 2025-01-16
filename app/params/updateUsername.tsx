import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import colors from "../../config/colors";
import { updateProfile } from "firebase/auth";

export default function UpdateUsername({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState(auth.currentUser?.displayName || "");
  const [loading, setLoading] = useState(false);

  const saveUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Validation Error", "Username cannot be empty.");
      return;
    }

    if (username.length > 25) {
      Alert.alert("Validation Error", "Username cannot exceed 25 characters.");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, "users", auth.currentUser?.uid || "");
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const usernameEdit = userData.usernameEdit?.toDate();
        if (usernameEdit) {
          const now = new Date();
          const diffInMs = now.getTime() - usernameEdit;
          const diffInHours = diffInMs / (1000 * 60 * 60);
          console.log(diffInHours);
          if (diffInHours < 2) {
            Alert.alert(
              "Wait Period",
              "You can only change your username once every 2 hours."
            );
            setLoading(false);
            return;
          }
        }
      }

      const userReference = collection(db, "users");
      const q = query(
        userReference,
        where("username", "==", username.toLowerCase())
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        Alert.alert("Validation Error", "Username already taken.");
        setLoading(false);
        return;
      }

      await updateDoc(userDocRef, {
        username: username.toLowerCase(),
        usernameEdit: new Date(),
      });

      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: username.toLowerCase() });
      }

      Alert.alert("Success", "Your username has been updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", "Failed to update username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Update Your Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new username"
        value={username}
        onChangeText={setUsername}
        editable={!loading}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveUsername}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Username</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
