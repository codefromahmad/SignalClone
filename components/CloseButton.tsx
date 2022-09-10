import { Text, TouchableOpacity, View } from "react-native";
import React, { Component } from "react";
import { AntDesign } from "@expo/vector-icons";

const CloseButton = () => {
  return (
    <View style={{ marginHorizontal: 10 }}>
      <AntDesign
        style={{
          borderRadius: 10,
          padding: 3,
          backgroundColor: "lightgray",
        }}
        name="close"
        size={15}
        color="black"
      />
    </View>
  );
};

export default CloseButton;
