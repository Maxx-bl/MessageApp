import React, { useState, useLayoutEffect, useCallback } from "react";
import { ImageBackground, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import colors from "../../config/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    const collectionRef = collection(db, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: data._id,
            createdAt: data.createdAt.toDate(),
            text: data.text,
            user: data.user,
          } as IMessage;
        })
      );
    });

    return unsubscribe;
  }, []);

  // Handle sending new messages
  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(db, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      onSend={(messages) => onSend(messages)}
      messagesContainerStyle={{
        backgroundColor: colors.background,
      }}
      user={{
        _id: auth?.currentUser?.email || "",
        avatar: "https://i.pravatar.cc/300",
      }}
    />
  );
}
