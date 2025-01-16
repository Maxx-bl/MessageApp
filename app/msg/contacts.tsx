import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import colors from "../../config/colors";
import { ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/config/firebase";
const CryptoJS = require("crypto-js");
import Config from "../../settings.json";

export default function Contacts({ navigation }: { navigation: any }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const ENCRYPTION_KEY = Config.ENCRYPTION_KEY;

  const decryptMessage = (encryptedMessage: any) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleSearchSubmit = async () => {
    if (searchQuery === "") return fetchContacts();
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "!=", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        username: doc.data().username,
        ...doc.data(),
      }));

      const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setContacts(filteredUsers);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const convRef = collection(db, "chats");
      const q = query(
        convRef,
        where("participants", "array-contains", auth.currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);

      const participantUIDs = new Set();
      querySnapshot.forEach((doc) => {
        const { participants } = doc.data();
        participants
          .filter((uid: string) => uid !== auth.currentUser?.uid)
          .forEach((uid: string) => participantUIDs.add(uid));
      });

      if (participantUIDs.size > 0) {
        const usersRef = collection(db, "users");
        const qUsers = query(
          usersRef,
          where("uid", "in", Array.from(participantUIDs))
        );
        const querySnapshotUsers = await getDocs(qUsers);

        const contactList = querySnapshotUsers.docs.map((doc) => ({
          uid: doc.id,
          username: doc.data().username,
          ...doc.data(),
          lastMsg: "",
          lastMsgDate: null,
        }));

        for (const contact of contactList) {
          const lastMessage = await fetchLastMessage(contact.uid);
          contact.lastMsg = decryptMessage(lastMessage.text);
          contact.lastMsgDate = lastMessage.createdAt;
        }

        const sortedContacts = contactList.sort((a, b) => {
          if (a.lastMsgDate && b.lastMsgDate) {
            return b.lastMsgDate - a.lastMsgDate;
          } else if (a.lastMsgDate) {
            return -1;
          } else if (b.lastMsgDate) {
            return 1;
          }
          return 0;
        });

        setContacts(sortedContacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastMessage = async (contactUid: string) => {
    try {
      const chatRef = collection(db, "chats");
      const q = query(
        chatRef,
        where("participants", "array-contains", contactUid)
      );

      const querySnapshot = await getDocs(q);

      const messages = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt,
      }));

      messages.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      return messages[0] || { text: "", createdAt: null };
    } catch (error) {
      console.error("Error fetching last message:", error);
      return { text: "", createdAt: null };
    }
  };

  useLayoutEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Animated.Text style={styles.loadingText}>
          Loading contacts...
        </Animated.Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <FontAwesome
          name="search"
          size={20}
          color={colors.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Entypo
            name="cross"
            size={26}
            color={colors.gray}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchContacts} />
        }
      >
        <Animated.View style={[styles.block]}>
          {filteredContacts.length > 0 ? (
            <Animated.FlatList
              skipEnteringExitingAnimations
              data={filteredContacts}
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
                      {item.lastMsg ? (
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 10,
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>
                            {(() => {
                              const messageDate = new Date(
                                item.lastMsgDate.seconds * 1000
                              );
                              const now = new Date();

                              const timeDifference =
                                now.getTime() - messageDate.getTime();

                              if (timeDifference < 24 * 60 * 60 * 1000) {
                                return messageDate.toLocaleString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              } else {
                                return messageDate.toLocaleDateString();
                              }
                            })()}
                          </Text>

                          <Text style={{ fontSize: 14 }}>
                            {item.lastMsg.length < 30
                              ? item.lastMsg
                              : `${item.lastMsg.substring(0, 30)}...`}
                          </Text>
                        </View>
                      ) : (
                        <></>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : searchQuery == null ? (
            <View style={styles.loadingContainer}>
              <Animated.Text style={styles.loadingText}>
                You have no contact yet.
              </Animated.Text>
            </View>
          ) : (
            <></>
          )}
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
    backgroundColor: colors.background,
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
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 15,
    margin: 10,
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
});
