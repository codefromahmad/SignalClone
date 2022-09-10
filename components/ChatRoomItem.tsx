import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { User } from "../src/models";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoomUser } from "../src/models";
import { Message } from "../src/models";
import moment, * as moments from "moment";

const ChatRoomItem = ({ chtRoom, navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lastMessage, setLastMessage] = useState<Message>();
  const [chatRoom, setChatRoom] = useState(chtRoom);

  // console.log("Last Message: " + lastMessage);

  const fetchLastMessage = async () => {
    await DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(
      setLastMessage
    );
  };

  useEffect(() => {
    fetchLastMessage();
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(Message).subscribe((res) => {
      if (
        res.model === Message &&
        (res.opType === "INSERT" || res.opType === "UPDATE")
      ) {
        fetchLastMessage();
      }
    });

    return subscription.unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoom.id === chatRoom.id)
        .map((chatRoomUser) => chatRoomUser.user);

      setUsers(fetchedUsers);

      const authUser = await Auth.currentAuthenticatedUser();

      setUser(fetchedUsers.find((user) => user.id != authUser.attributes.sub));
    };
    fetchUsers();
  }, []);

  if (!user) {
    return <ActivityIndicator />;
  }

  const onPress = () => {
    console.log("clicked");
    navigation.navigate("ChatRoomScreen", { id: chatRoom.id });
  };

  const time = moment(lastMessage?.createdAt).from(moment());

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image
        style={styles.image}
        source={{
          uri: chatRoom.imageUri || user.imageUri,
        }}
      />
      {!!chatRoom.newMessages && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      )}

      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{chatRoom.name || user.name}</Text>
          <Text style={styles.text}>{time}</Text>
        </View>
        {lastMessage && (
          <Text numberOfLines={1} style={styles.text}>
            {lastMessage?.content}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default ChatRoomItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
  },
  rightContainer: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    borderRadius: 25,
    width: 50,
    height: 50,
    marginRight: 10,
  },
  badgeContainer: {
    position: "absolute",
    backgroundColor: "#3777f0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    top: 10,
    left: 45,
    width: 20,
    height: 20,
  },
  badgeText: { color: "white", alignSelf: "center", fontSize: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontWeight: "bold", fontSize: 18 },
  text: { color: "gray", marginBottom: 3 },
});
