import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ChatRoom, Message, User } from "../src/models";
import { useState, useEffect } from "react";
import { ChatRoomUser } from "../src/models";
import { useNavigation, useRoute } from "@react-navigation/native";
import GroupUser from "../components/GroupUser";
import {
  AntDesign,
  Entypo,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import GroupInfoHeader from "../components/GroupInfoHeader";
import AdminGroupUser from "../components/AdminGroupUsers";
export default function UsersScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [authUser, setAuthUser] = useState();
  const [admin, setAdmin] = useState<string | undefined>(undefined);
  const [chatRoom, setChatRoom] = useState<ChatRoom>();

  const fetchChatRoom = async () => {
    const data = await DataStore.query(ChatRoom, route.params?.id);
    setChatRoom(data);
    setAdmin(data?.chatRoomAdminId);
  };

  useEffect(() => {
    fetchChatRoom();
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(ChatRoom).subscribe((msg) => {
      if (
        msg.model === ChatRoom &&
        (msg.opType === "INSERT" ||
          msg.opType === "UPDATE" ||
          msg.opType === "DELETE")
      ) {
        fetchChatRoom();
      }
    });

    return subscription.unsubscribe;
  }, []);

  useEffect(() => {
    const fetchAuthUser = async () => {
      const data = await Auth.currentAuthenticatedUser();
      setAuthUser(data.attributes.sub);
    };
    fetchAuthUser();
  }, []);

  const isAdmin = authUser === admin;
  const isMe = (user) => user.id === authUser;

  useEffect(() => {
    const getUsers = async () => {
      const users = (await DataStore.query(ChatRoomUser))
        .filter((c) => c.chatRoom.id === route.params?.id)
        .map((chatRoomUser) => chatRoomUser.user);
      setUsers(users);
    };
    getUsers();
  }, []);

  const exitGroup = async () => {
    console.log("Exit Group");
    if (chatRoom) {
      const data = (await DataStore.query(ChatRoomUser)).filter(
        (item) => item.chatRoom.id === chatRoom?.id && item.user.id === authUser
      );

      console.log(data);
      if (data.length > 0) await DataStore.delete(data[0]);

      setUsers(users.filter((item) => item.id != authUser));

      navigation.navigate("Home", {
        message: "Success! Exited from the group successfully.",
      });
    }
  };

  const confirmExitGroup = () => {
    Alert.alert("Exit Group", `Do you really want to Exit ${chatRoom?.name}?`, [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("Cancel Pressed"),
      },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => exitGroup(),
      },
    ]);
  };

  const deleteGroup = async () => {
    if (chatRoom) {
      await DataStore.delete(ChatRoom, chatRoom.id);
      await DataStore.delete(Message, (item) =>
        item.chatroomID("eq", chatRoom.id)
      );
    }
    navigation.navigate("Home", {
      message: "Success! Deleted group successfully.",
    });
  };

  const confirmDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      `Do you really want to Delete ${chatRoom?.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancel Pressed"),
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => deleteGroup(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar backgroundColor="black" />
      {isAdmin ? (
        <>
          {/* To Do
          <TouchableOpacity
            onPress={() => {}}
            style={{
              position: "absolute",
              top: 300,
              right: 10,
              zIndex: 1,
              flexDirection: "row",
              padding: 12,
              alignItems: "center",
              backgroundColor: "black",
              borderRadius: 30,
            }}
          >
            <Entypo name="add-user" size={18} color="white" />
          </TouchableOpacity> */}
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <AdminGroupUser
                chatRoom={chatRoom}
                users={users}
                setUsers={setUsers}
                isMe={isMe(item)}
                user={item}
                admin={admin}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <GroupInfoHeader
                chatRoom={chatRoom}
                users={users}
                admin={isAdmin}
              />
            )}
          />
        </>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <GroupUser isMe={isMe(item)} user={item} admin={admin} />
          )}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <GroupInfoHeader
              chatRoom={chatRoom}
              users={users}
              admin={isAdmin}
            />
          )}
        />
      )}
      {isAdmin ? (
        <TouchableOpacity onPress={confirmDeleteGroup}>
          <View
            style={{
              // position: "absolute",
              // bottom: 0,
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "#ff5263",
              borderRadius: 40,
              alignSelf: "center",
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginBottom: 20,
            }}
          >
            <AntDesign name="deleteusergroup" size={25} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                paddingLeft: 10,
                fontWeight: "bold",
              }}
            >
              Delete Group
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={confirmExitGroup}>
          <View
            style={{
              // position: "absolute",
              // bottom: 0,
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "#ff5263",
              borderRadius: 40,
              alignSelf: "center",
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginBottom: 20,
            }}
          >
            <Ionicons name="exit-outline" size={25} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                paddingLeft: 10,
                fontWeight: "bold",
              }}
            >
              Exit Group
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "white", flex: 1 },
});
