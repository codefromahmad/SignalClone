import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import ChatRoomItem from "../components/ChatRoomItem";
import { useNavigation } from "@react-navigation/core";
import { Auth } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import { DataStore } from "aws-amplify";
import { useRoute } from "@react-navigation/core";
import { AntDesign } from "@expo/vector-icons";

export default function HomeScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [showMessage, setShowMessage] = useState<boolean>(true);

  const route = useRoute();
  const message = route.params?.message;

  const fetchChatRooms = async () => {
    const userData = await Auth.currentAuthenticatedUser();

    const chatRooms = (await DataStore.query(ChatRoomUser))
      .filter(
        (chatRoomUser) => chatRoomUser.user.id === userData.attributes.sub
      )
      .map((chatRoomUser) => chatRoomUser.chatRoom);
    setChatRooms(chatRooms);
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(ChatRoomUser).subscribe((res) => {
      if (
        res.model === ChatRoomUser &&
        (res.opType === "UPDATE" ||
          res.opType === "INSERT" ||
          res.opType === "DELETE")
      ) {
        setShowMessage(true);
        fetchChatRooms();
      }
    });

    return subscription.unsubscribe;
  }, []);

  const logOut = async () => {
    Auth.signOut();
  };

  useEffect(() => {
    const interval = setInterval(() => setShowMessage(false), 3000);
    setShowMessage(true);
    return () => clearInterval(interval);
  }, [message]);

  const navigation = useNavigation();
  return (
    <View style={styles.page}>
      {message && showMessage && (
        <View
          style={{
            backgroundColor: "#46b500",
            flexDirection: "row",
            padding: 15,
          }}
        >
          <AntDesign name="infocirlceo" size={18} color="white" />
          <Text style={{ color: "white", paddingLeft: 10 }}>{message}</Text>
        </View>
      )}
      <FlatList
        data={chatRooms}
        renderItem={({ item }) => (
          <ChatRoomItem navigation={navigation} chtRoom={item} />
        )}
        inverted
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={{
          height: 50,
          margin: 10,
          backgroundColor: "orange",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={logOut}
      >
        <Text>LogOut</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "white", flex: 1 },
});
