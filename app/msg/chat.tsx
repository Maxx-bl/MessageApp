import React, { useState, useLayoutEffect, useCallback } from "react";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  where,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import colors from "../../config/colors";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
const CryptoJS = require("crypto-js");
import Config from "../../settings.json";
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { Composer } from "react-native-gifted-chat";

export default function Chat({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const { recipientId, recipientEmail, recipientName, recipientAvatar } =
    route.params;

  const conversationId = [auth?.currentUser?.uid, recipientId].sort().join("_");

  const ENCRYPTION_KEY = Config.ENCRYPTION_KEY;

  const encryptMessage = (message: any) => {
    return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
  };

  const decryptMessage = (encryptedMessage: any) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useLayoutEffect(() => {
    const fetchUnreadMessages = async () => {
      const chatRef = collection(db, "chats");
      const q = query(
        chatRef,
        where("conversationId", "==", conversationId),
        where("user._id", "==", recipientEmail),
        where("isRead", "==", false)
      );
      const snapshot = await getDocs(q);

      snapshot.forEach((document) => {
        const docRef = doc(db, "chats", document.id);
        updateDoc(docRef, { isRead: true });
      });
    };
    fetchUnreadMessages();
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={
              recipientAvatar
                ? { uri: recipientAvatar }
                : require("../../assets/images/default-profile-picture.jpg")
            }
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            @{recipientName}
          </Text>
        </View>
      ),
    });
  }, [navigation, recipientName, recipientAvatar]);

  useLayoutEffect(() => {
    const collectionRef = collection(db, "chats");
    const q = query(
      collectionRef,
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const decryptedText = decryptMessage(data.text);
          return {
            _id: data._id,
            createdAt: data.createdAt.toDate(),
            text: decryptedText,
            user: data.user,
          } as IMessage;
        })
      );
    });

    return unsubscribe;
  }, [conversationId]);

  const onSend = useCallback(
    (messages: IMessage[] = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      const { _id, createdAt, text, user } = messages[0];
      const encryptedText = encryptMessage(text);

      addDoc(collection(db, "chats"), {
        _id,
        createdAt,
        text: encryptedText,
        user,
        participants: [auth?.currentUser?.uid, recipientId],
        conversationId,
        isRead: false,
      });
    },
    [conversationId, recipientId]
  );

  const renderInputToolbar = (props: any) => {
    return (
      <View style={styles.inputToolbarContainer}>
        {/* <TouchableOpacity style={styles.attachmentButton}>
          <Feather name="paperclip" size={32} color={colors.primary} />
        </TouchableOpacity> */}
        <TextInput
          style={styles.textInput}
          placeholder="Message..."
          placeholderTextColor="#aaa"
          value={text}
          multiline={true}
          onChangeText={setText}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            if (text.trim()) {
              onSend([
                {
                  _id: `${Math.random().toString()}-${Date.now()}`,
                  text,
                  createdAt: new Date(),
                  user: {
                    _id: auth?.currentUser?.email || "",
                    avatar: auth?.currentUser?.photoURL
                      ? auth?.currentUser?.photoURL
                      : `https://avatar.iran.liara.run/username?username=${auth?.currentUser?.displayName}`,
                  },
                },
              ]);
              setText("");
            }
          }}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      messagesContainerStyle={{
        backgroundColor: colors.background,
      }}
      user={{
        _id: auth?.currentUser?.email || "",
        avatar: auth?.currentUser?.photoURL
          ? auth?.currentUser?.photoURL
          : `https://avatar.iran.liara.run/username?username=${auth?.currentUser?.displayName}`,
      }}
      renderInputToolbar={renderInputToolbar}
    />
  );
}

const styles = StyleSheet.create({
  inputToolbarContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.background,
  },
  attachmentButton: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 10,
  },
});
