import { Entypo, Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore, Storage } from "aws-amplify";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import LottieView from "lottie-react-native";
import { S3Image } from "aws-amplify-react-native";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { v4 as uuidv4 } from "uuid";
import { ChatRoom } from "../src/models";
import { Message } from "../src/models";

const GroupInfoHeader = ({ chatRoom, users, admin }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const saveImage = async () => {
    setLoading(true);
    if (!image) {
      return;
    }
    const imageParts = image.split(".");
    const extension = imageParts[imageParts.length - 1];
    const blob = await geBlob(image);
    const { key } = await Storage.put(`${uuidv4()}.${extension}`, blob);

    await DataStore.save(
      ChatRoom.copyOf(chatRoom, (updated) => {
        updated.imageUri = key;
      })
    ).then(() => {
      setTimeout(() => {
        setLoading(false);
        setImage(null);
      }, 3000);
    });
  };

  const geBlob = async (uri: string) => {
    return await fetch(uri).then((res) => res.blob());
  };

  const navigation = useNavigation();
  return (
    <SafeAreaView>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 30,
          left: 15,
          zIndex: 1,
          backgroundColor: "white",
          padding: 5,
          borderRadius: 20,
        }}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="navigate-before" size={30} color="black" />
      </TouchableOpacity>
      {!loading && (
        <View>
          {admin && (
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 170,
                right: 100,
                zIndex: 1,
                backgroundColor: "green",
                padding: 10,
                borderRadius: 20,
              }}
            >
              {image ? (
                <Ionicons
                  name="ios-save"
                  size={20}
                  color="white"
                  onPress={saveImage}
                />
              ) : (
                <MaterialIcons
                  name="add-a-photo"
                  size={20}
                  color="white"
                  onPress={pickImage}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
          paddingVertical: 30,
        }}
      >
        {loading && (
          <View
            style={{
              position: "absolute",
              height: 210,
              width: 210,
              borderRadius: 105,
              zIndex: 10,
              justifyContent: "center",
              alignItems: "center",
              top: 25,
              backgroundColor: "black",
              opacity: 0.6,
            }}
          >
            <LottieView
              style={{ height: 100 }}
              source={require("../assets/animations/loading.json")}
              autoPlay
              speed={0.5}
            />
          </View>
        )}
        {image ? (
          <>
            <Image
              source={{ uri: image }}
              style={{
                borderColor: "white",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "black",
              }}
            />
          </>
        ) : (
          // <S3Image
          //   imgKey={chatRoom.imageUri}
          //   style={{
          //     borderColor: "white",
          //     width: 200,
          //     height: 200,
          //     borderRadius: 100,
          //     backgroundColor: "black",
          //   }}
          //   resizeMode="contain"
          // />
          <Image
            source={{ uri: chatRoom?.imageUri }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "black",
            }}
          />
        )}
      </View>
      <Text
        style={{
          backgroundColor: "lightgray",
          padding: 20,
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {chatRoom?.name}
      </Text>
      <View
        style={{
          marginVertical: 5,
          borderBottomColor: "lightgray",
          //   borderBottomWidth: 1,
        }}
      />
      <Text style={{ fontSize: 15, marginHorizontal: 10, fontWeight: "bold" }}>
        {users.length} {users.length > 1 ? "Group Members" : "Group Member"}
      </Text>
    </SafeAreaView>
  );
};

export default GroupInfoHeader;
