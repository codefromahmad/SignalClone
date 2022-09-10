import React, { useEffect, useState } from "react";
import { FontAwesome, Fontisto } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { User } from "../src/models";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoomUser } from "../src/models";
import moment from "moment";
import { ChatRoom } from "../src/models";
import { useNavigation } from "@react-navigation/native";

const ChatRoomHeader = (props) => {
  console.log("looping...");
  const chatRoomId = props.id;
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | undefined>();
  const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>();

  const navigation = useNavigation();

  // useEffect(() => {
  //   if (!user) {
  //     return;
  //   }
  //   const subscription = DataStore.observe(User, user.id).subscribe((msg) => {
  //     if (msg.model === User && msg.opType === "UPDATE") {
  //       setUser(msg.element);
  //     }
  //   });
  //   return subscription.unsubscribe;
  // }, [user?.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoom.id === chatRoomId)
        .map((chatRoomUser) => chatRoomUser.user);
      setUsers(fetchedUsers);

      const authUser = await Auth.currentAuthenticatedUser();

      setUser(fetchedUsers.find((user) => user.id != authUser.attributes.sub));
    };
    fetchUsers();
  }, []);

  const getUserNames = () => {
    if (!isGroup) {
      return;
    }
    return users.map((user) => user.name).join(",");
  };

  const fetchChatRoom = async () => {
    await DataStore.query(ChatRoom, chatRoomId).then(setChatRoom);
  };

  useEffect(() => {
    fetchChatRoom();
  }, [chatRoomId]);

  const lastOnlineText = () => {
    if (!user?.lastOnlineAt) {
      return;
    }

    const diffinMS = moment().diff(moment(user.lastOnlineAt));
    if (diffinMS < 5 * 60 * 1000) {
      return "online";
    } else {
      return `Last online ${moment(user.lastOnlineAt).fromNow()}`;
    }
  };

  const isGroup = chatRoom?.name ? true : false;

  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width,
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: chatRoom?.imageUri || user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <TouchableOpacity
          onPress={() => {
            isGroup
              ? navigation.navigate("GroupInfoScreen", { id: chatRoom?.id })
              : console.log("It is user");
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
            }}
          >
            {chatRoom?.name || user?.name}
          </Text>
          {isGroup && (
            <Text
              numberOfLines={1}
              style={{ color: "lightgray", fontSize: 12 }}
            >
              {getUserNames()}
            </Text>
          )}
          {user?.lastOnlineAt && !isGroup && (
            <Text
              numberOfLines={1}
              style={{ color: "lightgray", fontSize: 12 }}
            >
              {lastOnlineText()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: "50%",
          paddingRight: 70,
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <Pressable>
          <FontAwesome name="video-camera" size={20} color="white" />
        </Pressable>
        <Pressable>
          <FontAwesome name="phone" size={20} color="white" />
        </Pressable>
        <Pressable>
          <Fontisto name="more-v-a" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default ChatRoomHeader;
