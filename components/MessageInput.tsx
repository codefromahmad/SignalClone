import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Auth, DataStore, Storage } from "aws-amplify";
import { ChatRoom, Message } from "../src/models";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Text } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import AudioPlayer from "./AudioPlayer";
import MessageComponent from "./Message";
import CloseButton from "./CloseButton";

const MessageInput = ({ chatRoom, messageReplyTo, removeMessageReplyTo }) => {
  const [message, setMessage] = useState("");
  const [isEmoji, setIsEmoji] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS != "web") {
        const libraryResopnse =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();
        if (
          libraryResopnse.status !== "granted" ||
          photoResponse.status !== "granted"
        ) {
          alert("Sorry, we need these permissions to make this work!");
        }
      }
    })();
  }, []);

  const resetFields = () => {
    setMessage("");
    setIsEmoji(false);
    setImage(null);
    setProgress(0);
    setSoundURI(null);
    removeMessageReplyTo(undefined);
  };

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

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };
  const sendMessage = async () => {
    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
        status: "SENT",
        replyToMessageID: messageReplyTo?.id,
      })
    );
    updateLastMessage(newMessage);
    resetFields();
  };

  const updateLastMessage = async (newMessage) => {
    DataStore.save(
      ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
        updatedChatRoom.LastMessage = newMessage;
      })
    );
  };

  const onPlusClicked = () => {
    console.warn("Plus button clicked");
  };

  const onPress = () => {
    if (image) {
      sendImage();
    } else if (soundURI) {
      sendAudio();
    } else if (message) {
      sendMessage();
    } else {
      onPlusClicked();
    }
  };

  const progressCallback = (progress) => {
    setProgress(progress.loaded / progress.total);
  };

  const sendImage = async () => {
    if (!image) {
      return;
    }
    const imageParts = image.split(".");
    const extension = imageParts[imageParts.length - 1];
    const blob = await geBlob(image);
    const { key } = await Storage.put(`${uuidv4()}.${extension}`, blob, {
      progressCallback,
    });

    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        image: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
        replyToMessageID: messageReplyTo?.id,
      })
    );

    updateLastMessage(newMessage);

    resetFields();
  };

  const geBlob = async (uri: string) => {
    return await fetch(uri).then((res) => res.blob());
  };

  const sendAudio = async () => {
    if (!soundURI) {
      return;
    }
    const uriParts = soundURI.split(".");
    const extension = uriParts[uriParts.length - 1];
    const blob = await geBlob(soundURI);
    const { key } = await Storage.put(`${uuidv4()}.${extension}`, blob, {
      progressCallback,
    });

    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        audio: key,
        status: "SENT",
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
        replyToMessageID: messageReplyTo?.id,
      })
    );

    updateLastMessage(newMessage);

    resetFields();
  };

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    if (!recording) {
      return;
    }
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);

    if (!uri) {
      return;
    }
    setSoundURI(uri);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { height: isEmoji ? "50%" : "auto" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={200}
    >
      {messageReplyTo && (
        <View
          style={{
            backgroundColor: "#f2f2f2",
            padding: 5,
            borderRadius: 10,
            marginVertical: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Text style={{ marginHorizontal: 10 }}>Replying to:</Text>
            <TouchableOpacity
              style={{ marginHorizontal: 10 }}
              onPress={() => {
                removeMessageReplyTo();
              }}
            >
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
            </TouchableOpacity>
          </View>
          <MessageComponent message={messageReplyTo} />
        </View>
      )}
      {image && (
        <View style={styles.imageRoot}>
          <View style={styles.sendImageContainer}>
            <Image
              source={{ uri: image }}
              style={{ width: 100, height: 100, borderRadius: 10 }}
            />
            <TouchableOpacity
              onPress={() => {
                setImage(null);
              }}
            >
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
            </TouchableOpacity>
          </View>
          {!!progress && (
            <View
              style={{
                marginVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  height: 5,
                  maxWidth: "90%",
                  width: `${progress * 100}%`,
                  borderColor: "#3777f0",
                  borderRadius: 15,
                  borderWidth: 3,
                }}
              ></View>
              <Text
                style={{
                  textAlign: "center",
                  paddingLeft: 5,
                }}
              >
                {(progress * 100).toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
      )}

      {soundURI && (
        <View
          style={{
            backgroundColor: "#f4f4f4",
            padding: 10,
            borderRadius: 10,
            marginVertical: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => setSoundURI(null)}
            style={{ flexDirection: "row", justifyContent: "flex-end" }}
          >
            <CloseButton />
          </TouchableOpacity>
          <AudioPlayer soundURI={soundURI} />
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setIsEmoji(!isEmoji)}>
            <SimpleLineIcons
              style={styles.icon}
              name="emotsmile"
              size={24}
              color="#595959"
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type something here"
          />
          <TouchableOpacity onPress={() => pickImage()}>
            <Feather
              name="image"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => takePhoto()}>
            <Feather
              name="camera"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </TouchableOpacity>
          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <MaterialCommunityIcons
              name={recording ? "microphone" : "microphone-outline"}
              size={recording ? 26 : 24}
              color={recording ? "red" : "black"}
              style={[
                styles.icon,
                recording ? { backgroundColor: "white", borderRadius: 20 } : {},
              ]}
            />
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
            {message || image || soundURI ? (
              <Ionicons
                name="send"
                size={24}
                color="white"
                style={styles.icon}
              />
            ) : (
              <Feather
                name="plus"
                size={24}
                color="white"
                style={styles.icon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {isEmoji && (
        <EmojiSelector
          onEmojiSelected={(emoji) => setMessage(message + emoji)}
          columns={8}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  root: { padding: 10 },
  imageRoot: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
  },
  sendImageContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  row: { flexDirection: "row" },
  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#dedede",
    alignItems: "center",
    paddingHorizontal: 5,
    flexDirection: "row",
  },
  icon: {
    margin: 5,
  },
  input: {
    flex: 1,
  },
  buttonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#3777f0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 35,
  },
});
