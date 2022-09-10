import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

const NewGroupButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
        backgroundColor: "#66de90",
      }}
    >
      <MaterialIcons name="group-add" size={30} color="black" />
      <Text style={{ marginHorizontal: 10, fontSize: 16 }}>
        Create New Group
      </Text>
    </TouchableOpacity>
  );
};

export default NewGroupButton;
