import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import UserItem from "../components/UserItem";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User } from "../src/models";
import { useState, useEffect } from "react";
import { ChatRoomUser } from "../src/models";
import NewGroupButton from "../components/NewGroupButton";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  let [chatRoomId, setChatRoomId] = useState<string>("");

  useEffect(() => {
    const getUsers = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      const allUsers = await DataStore.query(User);
      setUsers(allUsers.filter((user) => user.id != dbUser?.id));
    };
    getUsers();
  }, []);

  const isUserSelected = (user) => {
    console.log(selectedUsers);
    return selectedUsers.some((selectedUser) => selectedUser.id == user.id);
  };

  const checkForChatRoom = (c) => {
    if (c.name === undefined) {
      return c.id;
    }
  };

  const chatRoomAlreadyExist = async (user) => {
    console.log("Clicked User: " + user.name);
    const data = await (
      await DataStore.query(ChatRoomUser)
    )
      .filter((chatRoomUser) => chatRoomUser.user.id === user.id)
      .map((chatRoomUser) => chatRoomUser.chatRoom)
      .some((c) => checkForChatRoom(c));
    return data;
  };

  const getExistedChatRoomID = async (user) => {
    let id;
    (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.user.id === user.id)
      .map((chatRoomUser) => chatRoomUser.chatRoom)
      .some((c) => (c.name === undefined ? (id = c.id) : ""));

    return id;
  };

  const onUserPress = async (user) => {
    setChatRoomId("");
    if (isNewGroup) {
      console.log("Inside NewGroup");
      if (isUserSelected(user)) {
        setSelectedUsers(selectedUsers.filter((item) => item.id != user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }

      console.log("Total Selected Users: " + selectedUsers.length);
    } else {
      if (await chatRoomAlreadyExist(user)) {
        console.log("Chat Room already exist!");
        const chatRoomId = await getExistedChatRoomID(user);
        console.log("And It is the ID: " + chatRoomId);
        navigation.navigate("ChatRoomScreen", {
          id: chatRoomId,
        });
      } else {
        console.log("chat room doesnot exist!");
        await createChatRoom(user);
      }
    }
  };

  const addUserToChatRoom = async (user, chatRoom) => {
    await DataStore.save(
      new ChatRoomUser({
        user,
        chatRoom,
      })
    );
  };

  const createChatRoom = async (users) => {
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    if (!dbUser) {
      Alert.alert("There was an error creating the group");
      return;
    }

    const newChatRoomData = {
      newMessages: 0,
    };

    if (isNewGroup) {
      newChatRoomData.Admin = dbUser;
      newChatRoomData.name = "New Group 01";
      newChatRoomData.imageUri =
        "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";
    }

    const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));

    if (dbUser) {
      await addUserToChatRoom(dbUser, newChatRoom);
    }

    if (isNewGroup) {
      await Promise.all(
        users.map((user) => addUserToChatRoom(user, newChatRoom))
      );
    } else {
      await addUserToChatRoom(users, newChatRoom);
    }

    navigation.navigate("ChatRoomScreen", { id: newChatRoom.id });
  };

  const saveGroup = async () => {
    console.log("Inside SaveGroup");
    await createChatRoom(selectedUsers);
  };

  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserItem
            onPress={() => onUserPress(item)}
            user={item}
            isSelected={isNewGroup ? isUserSelected(item) : undefined}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
        )}
      />
      {isNewGroup && selectedUsers.length > 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: "#3777f0",
            marginHorizontal: 10,
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            alignItems: "center",
          }}
          onPress={saveGroup}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Save Group ({selectedUsers.length})
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "white", flex: 1 },
});
