import { MaterialIcons } from "@expo/vector-icons";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SwipeRow } from "react-native-swipe-list-view";
import { ChatRoomUser, User } from "../src/models";

const AdminGroupUser = ({ chatRoom, users, setUsers, isMe, admin, user }) => {
  // const [users, setUsers] = useState<User[]>([]);

  const checkIfAdmin = (user) => {
    return user.id === admin;
  };

  const removeUser = async (user) => {
    console.log(`Yes want to remove ${user.name}?`);
    if (chatRoom) {
      const data = (await DataStore.query(ChatRoomUser)).filter(
        (item) => item.chatRoom.id === chatRoom?.id && item.user.id === user.id
      );

      console.log(data);
      if (data.length > 0) await DataStore.delete(data[0]);

      setUsers(users.filter((item) => item.id != user.id));
    }
  };

  const confirmRemove = (user) => {
    Alert.alert(
      "Remove Person",
      `Do you really want to remove ${user?.name} from group?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancel Pressed"),
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => removeUser(user),
        },
      ]
    );
  };

  return (
    <View style={styles.standalone}>
      <SwipeRow
        closeOnRowPress
        disableLeftSwipe
        disableRightSwipe={checkIfAdmin(user)}
        leftOpenValue={50}
        rightOpenValue={-50}
      >
        <View style={styles.standaloneRowBack}>
          <TouchableOpacity
            style={{
              alignSelf: "center",
              backgroundColor: "red",
              marginLeft: 10,
              padding: 5,
              borderRadius: 30,
            }}
            onPress={() => confirmRemove(user)}
          >
            <MaterialIcons name="delete-forever" size={25} color="white" />
          </TouchableOpacity>
          <Text style={styles.backTextWhite}>Left</Text>
        </View>
        <View style={styles.standaloneRowFront}>
          <View style={styles.container}>
            <Image
              style={styles.image}
              source={{
                uri: user.imageUri,
              }}
            />
            <View style={styles.rightContainer}>
              <View style={styles.row}>
                <Text style={styles.name}>{isMe ? "You" : user.name}</Text>
                {checkIfAdmin(user) && <Text>admin</Text>}
              </View>
            </View>
          </View>
        </View>
      </SwipeRow>
    </View>
  );
};

export default AdminGroupUser;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
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
  standalone: { marginVertical: 10 },
  backTextWhite: {
    color: "#FFF",
  },
  standaloneRowFront: {
    alignItems: "center",
    backgroundColor: "white",
    justifyContent: "center",
    height: 50,
  },
  standaloneRowBack: {
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
    flexDirection: "row",
    paddingRight: 10,
    justifyContent: "space-between",
    // padding: 10,
  },
  badgeText: { color: "white", alignSelf: "center", fontSize: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontWeight: "bold", fontSize: 18 },
  text: { color: "gray", marginBottom: 3 },
});
