import React, { useEffect, useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
  Image,
} from "react-native";
import colors from "../../config/colors";
import { ScrollView } from "react-native";
import { useState } from "react";
import Animated from "react-native-reanimated";

import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

export default function Contacts({ navigation }: { navigation: any }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all users except the logged-in user
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "!=", auth.currentUser?.uid));
        const querySnapshot = await getDocs(q);

        const users = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        setContacts(users);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <Text>Loading contacts...</Text>;
  }
  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View style={[styles.block]}>
          <Animated.FlatList
            skipEnteringExitingAnimations
            data={contacts}
            scrollEnabled={false}
            keyExtractor={(item) => item.uid.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  navigation.navigate("Chat", {
                    recipientId: item.uid,
                    recipientEmail: item.email,
                    recipientName: item.username,
                    recipientAvatar: item.avatar,
                  });
                }}
              >
                <Image
                  source={
                    item.avatar
                      ? { uri: item.avatar }
                      : require("../../assets/images/default-profile-picture.jpg")
                  }
                  style={styles.pfp}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingLeft: 5,
                    paddingVertical: 0,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {item.username}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  block: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 14,
    marginTop: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  pfp: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
