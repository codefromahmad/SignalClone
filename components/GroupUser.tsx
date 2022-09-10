import { useEffect } from "react";
import { View, Text, Image, StyleSheet, SafeAreaView } from "react-native";

const GroupUser = ({ isMe, admin, user }) => {
  const checkIfAdmin = (user) => {
    return user.id === admin;
  };

  return (
    <SafeAreaView>
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
    </SafeAreaView>
  );
};

export default GroupUser;

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
    backgroundColor: "red",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  badgeText: { color: "white", alignSelf: "center", fontSize: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontWeight: "bold", fontSize: 18 },
  text: { color: "gray", marginBottom: 3 },
});
