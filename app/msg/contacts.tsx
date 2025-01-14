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
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import { useState } from "react";
import { Stack } from "expo-router";
import { format } from "date-fns";
import Animated from "react-native-reanimated";

import contacts from "../../temp_data.json";

export default function Contacts({ navigation }: { navigation: any }) {
  const [items, setItems] = useState(contacts);

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View style={[styles.block]}>
          <Animated.FlatList
            skipEnteringExitingAnimations
            data={items}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  navigation.navigate("Chat", { recipientId: item.id });
                }}
              >
                <Image source={{ uri: item.img }} style={styles.pfp} />
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
                      {item.from}
                    </Text>
                    <Text style={{ fontSize: 16, color: colors.gray }}>
                      {item.msg.length > 35
                        ? `${item.msg.substring(0, 35)}...`
                        : item.msg}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.gray,
                      paddingRight: 50,
                      alignSelf: "flex-start",
                    }}
                  >
                    {format(item.date, "dd/MM/yyyy - hh:mm")}
                  </Text>
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
