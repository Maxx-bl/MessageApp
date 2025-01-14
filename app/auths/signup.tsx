import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import Feather from "@expo/vector-icons/Feather";
import colors from "../../config/colors";

export default function Signup({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onHandleSignup = async () => {
    if (email !== "" && password !== "" && username !== "") {
      const MIN_LENGTH = 3;
      if (username.length < MIN_LENGTH) {
        setErrorMsg(`Username must be at least ${MIN_LENGTH} characters long!`);
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMsg("Passwords do not match!");
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
        return;
      }
      const userReference = collection(db, "users");
      const q = query(userReference, where("username", "==", username));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setErrorMsg("Username already taken!");
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
      } else {
        setErrorMsg("");
        setSuccessMsg("Signup successful!");
        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
        createUserWithEmailAndPassword(auth, email, password)
          .then(async ({ user }) => {
            await updateProfile(user, { displayName: username });
            const userReference = collection(db, "users");
            await setDoc(doc(userReference, user.uid), {
              uid: user.uid,
              email: user.email,
              username: username,
              avatar: null,
              createdAt: serverTimestamp(),
            });
          })
          .catch((err) => Alert.alert("Signup error", err.message));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showPassword}
            textContentType="password"
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.toggleButtonText}>
              {showPassword ? (
                <Feather
                  name="eye-off"
                  size={24}
                  color={colors.gray}
                  style={{ marginRight: 10 }}
                />
              ) : (
                <Feather
                  name="eye"
                  size={24}
                  color={colors.gray}
                  style={{ marginRight: 10 }}
                />
              )}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showPassword}
          textContentType="password"
          value={passwordConfirm}
          onChangeText={(text) => setPasswordConfirm(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          autoCapitalize="none"
          keyboardType="default"
          textContentType="username"
          autoFocus={true}
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text
            style={{
              fontWeight: "bold",
              color: colors.background,
              fontSize: 18,
            }}
          >
            Start!
          </Text>
        </TouchableOpacity>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text
              style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary,
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: colors.mediumGray,
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mediumGray,
    height: 58,
    marginBottom: 20,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
  },
  toggleButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  whiteSheet: {
    width: "100%",
    height: "75%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
    alignSelf: "center",
  },
  success: {
    color: "green",
    fontSize: 16,
    marginBottom: 10,
    alignSelf: "center",
  },
});
