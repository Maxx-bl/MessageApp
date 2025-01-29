import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import colors from "../../config/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase";

export default function NewPost({ navigation }: { navigation: any }) {
  const [content, setContent] = useState("");
  const maxLength = 280;

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert("Empty Post", "Please write something before posting.");
      return;
    }

    const sendPost = async () => {
      const ref = collection(db, "posts");
      const newId = `${Math.random().toString()}-${Date.now()}`;
      await setDoc(doc(ref, newId), {
        _id: newId,
        content: content,
        createdAt: new Date(),
        userId: auth.currentUser?.uid,
        username: auth.currentUser?.displayName,
        avatar: auth.currentUser?.photoURL,
      });
    };
    sendPost();
    setContent("");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Write a new post..."
        value={content}
        onChangeText={setContent}
        multiline={true}
        autoFocus={true}
        maxLength={maxLength}
      />

      {/* Character Counter */}
      <Text style={styles.charCount}>
        {content.length}/{maxLength}
      </Text>

      {/* Post Button */}
      <View style={styles.floatingButton}>
        <TouchableOpacity onPress={handlePost} style={styles.newpostButton}>
          <Ionicons name="send" size={24} color={colors.lightGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  input: {
    width: "100%",
    minHeight: 100,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 18,
    textAlignVertical: "top",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 5,
    color: colors.gray,
  },
  newpostButton: {
    backgroundColor: colors.primary,
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  floatingButton: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
});
