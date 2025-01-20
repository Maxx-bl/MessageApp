import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import colors from "../../config/colors";
import { updateProfile } from "firebase/auth";

export default function UpdateAvatar({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(auth.currentUser?.photoURL || null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      const imageSize = result.assets[0].fileSize;

      const sizeLimit = 1 * 1024 * 1024;

      if (imageSize !== undefined && imageSize > sizeLimit) {
        Alert.alert(
          "File Too Large",
          "The selected image is too large. Please choose a smaller image."
        );
        return null;
      } else if (imageSize === undefined) {
        Alert.alert(
          "Error",
          "Unable to determine image size. Please try another image."
        );
        return null;
      }

      setImage(selectedImage);
      return selectedImage;
    }
    return null;
  };

  // Convert image to Base64 encoding
  const getBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return base64String;
  };

  const saveAvatar = async () => {
    const uri = await pickImage();
    if (uri == null) return;

    setLoading(true);

    try {
      const base64Image = await getBase64(uri);

      const userDocRef = doc(db, "users", auth.currentUser?.uid || "");
      await updateDoc(userDocRef, { avatar: base64Image });

      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { photoURL: base64Image });
      }

      Alert.alert("Success", "Your profile picture has been updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating avatar:", error);
      Alert.alert("Error", "Failed to update avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const notAvailable = () => {
    Alert.alert("Work in progress...", "This feature is not available yet.");
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          image
            ? { uri: image }
            : require("../../assets/images/default-profile-picture.jpg")
        }
        style={styles.profileImage}
      />
      <TouchableOpacity
        style={styles.changeButton}
        onPress={notAvailable}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Changer d'avatar</Text>
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
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  changeButton: {
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
