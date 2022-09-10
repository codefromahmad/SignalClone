import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";

const UserItem = ({ user, onPress, isSelected }) => {
  // const onPress = async () => {
  //   // Create chat room with that users

  //   const newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 1 }));

  //   // Get Authenticated User Data
  //   const authUser = await Auth.currentAuthenticatedUser();
  //   const dbUser = await DataStore.query(User, authUser.attributes.sub);

  //   // Connect Auth User with Chat Room
  //   await DataStore.save(
  //     new ChatRoomUser({
  //       user: dbUser,
  //       chatRoom: newChatRoom,
  //     })
  //   );

  //   // Connect Clicked User with Chat Room
  //   await DataStore.save(
  //     new ChatRoomUser({
  //       user,
  //       chatRoom: newChatRoom,
  //     })
  //   );

  //   navigation.navigate("ChatRoomScreen", { id: newChatRoom.id });
  // };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        style={styles.image}
        source={{
          uri: user.imageUri,
        }}
      />
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
      {isSelected != undefined && (
        <Feather
          name={isSelected ? "check-circle" : "circle"}
          size={22}
          color={isSelected ? "green" : "#4f4f4f"}
        />
      )}
    </TouchableOpacity>
  );
};

export default UserItem;

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
  badgeText: { color: "white", alignSelf: "center", fontSize: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontWeight: "bold", fontSize: 18 },
  text: { color: "gray", marginBottom: 3 },
});
