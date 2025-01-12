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

export default function Chat({ route }: { route: any }) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { recipientId } = route.params;

  const conversationId = [auth?.currentUser?.email, recipientId]
    .sort()
    .join("_");

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
        participants: [auth?.currentUser?.email, recipientId],
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
        avatar: "https://i.pravatar.cc/300",
      }}
    />
  );
}
