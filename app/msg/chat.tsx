import React, { useState, useLayoutEffect, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import colors from "../../config/colors";
import { View, Image, Text } from "react-native";

export default function Chat({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { recipientId, recipientEmail, recipientName, recipientAvatar } =
    route.params;

  const conversationId = [auth?.currentUser?.uid, recipientId].sort().join("_");

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
            {recipientName}
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
  }, [conversationId]);

  const onSend = useCallback(
    (messages: IMessage[] = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      const { _id, createdAt, text, user } = messages[0];

      addDoc(collection(db, "chats"), {
        _id,
        createdAt,
        text,
        user,
        participants: [auth?.currentUser?.uid, recipientId],
        conversationId,
      });
    },
    [conversationId, recipientId]
  );

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
        avatar:
          recipientAvatar != null
            ? recipientAvatar
            : `https://dummyimage.com/300.png/09f/fff&text=${auth?.currentUser?.displayName}`,
      }}
    />
  );
}
