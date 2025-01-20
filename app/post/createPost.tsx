import React, { useEffect, useLayoutEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import colors from "../../config/colors";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { TextInput } from "react-native-gesture-handler";

export default function createPost({ navigation }: { navigation: any }) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [media, setMedia] = useState("");

    function sendPost() {
        addDoc(collection(db, "posts"), {
            _id: `${Math.random().toString()}-${Date.now()}`,
            createdAt: new Date(),
            title: title || null,
            content: content || null,
            media: media || null,
            user: {
                id: auth.currentUser?.email || null,
                avatar: auth.currentUser?.photoURL ? auth.currentUser.photoURL : `https://avatar.iran.liara.run/username?username=${auth?.currentUser?.displayName}`
            }
        })
    }

    return (
        <View>
            <TextInput
                placeholder="Titre..."
                autoCapitalize="none"
                keyboardType="default"
                value={title}
                onChangeText={(text) => setTitle(text)}
            />
            <TextInput
                placeholder="Contenu..."
                autoCapitalize="none"
                keyboardType="default"
                value={content}
                onChangeText={(text) => setContent(text)}
            />
            <TouchableOpacity
                onPress={sendPost}
            />
        </View>
    )
}