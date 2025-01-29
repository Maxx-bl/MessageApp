import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import colors from "../config/colors";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ScrollView } from "react-native-gesture-handler";

export default function Home({ navigation }: { navigation: any }) {
  const [userDisplayName, setUserDisplayName] = useState(
    auth.currentUser?.displayName
  );
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDisplayName(user.displayName);
      }
    });
    return unsubscribe;
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "posts");
      const q = query(ref, orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        content: doc.data().content,
        avatar: doc.data().avatar,
        createdAt: doc.data().createdAt,
        username: doc.data().username,
        userId: doc.data().userId,
      }));
      setPosts(postList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Animated.Text style={styles.loadingText}>
          Loading posts...
        </Animated.Text>
      </View>
    );
  }
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

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPosts} />
        }
      />

      <Animated.View style={[styles.block]}>
        <Animated.FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Text>{item.content}</Text>}
        />
      </Animated.View>

      <View style={styles.floatingButton}>
        <TouchableOpacity
          onPress={() => navigation.navigate("newPost")}
          style={styles.newpostButton}
        >
          <Entypo name="plus" size={40} color={colors.lightGray} />
        </TouchableOpacity>
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
  block: {
    backgroundColor: colors.background,
    borderRadius: 10,
    marginHorizontal: 14,
    marginTop: 20,
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
  newpostButton: {
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
    marginBottom: 10,
  },
  floatingButton: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
  },
});
