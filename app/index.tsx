import React, { useEffect, useLayoutEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import colors from "../config/colors";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const Home: React.FC = () => {
  const user = auth.currentUser;

  const navigation = useNavigation<ScreenNavigationProp>();

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 10 }} onPress={onSignOut}>
          {user?.photoURL ? (
            <View>
              <Image source={{ uri: user.photoURL }} />
              <AntDesign
                name="logout"
                size={24}
                color={colors.gray}
                style={{ marginRight: 10 }}
              />
            </View>
          ) : (
            <AntDesign
              name="logout"
              size={24}
              color={colors.gray}
              style={{ marginRight: 10 }}
            />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="home"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
        />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Contacts")}
        style={styles.contactButton}
      >
        <Entypo name="chat" size={24} color={colors.lightGray} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: colors.background,
  },
  contactButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
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
});

export default Home;
