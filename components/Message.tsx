import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Message as MessageModel, User } from "../src/models";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from "./AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import MessageReply from "./MessageReply";

const blue = "#3777f0";
const gray = "lightgrey";

const Message = (props) => {
  const { setAsMessageReply, message: propMessage } = props;
  const [message, setMessage] = useState<MessageModel>(propMessage);
  const [repliedTo, setRepliedTo] = useState<MessageModel | undefined>(
    undefined
  );
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(null);
  const [soundURI, setSoundURI] = useState<any>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    setMessage(propMessage);
  }, [propMessage]);

  useEffect(() => {
    if (message?.replyToMessageID) {
      DataStore.query(MessageModel, message.replyToMessageID).then(
        setRepliedTo
      );
    }
  }, [message]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await DataStore.query(User, message.userID);
      setUser(userData);
    };
    fetchUserData();
  }, []);
  // To save Request

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel && msg.opType === "UPDATE") {
          setMessage((message) => ({ ...message, ...msg.element }));
        }
        if (msg.model === MessageModel && msg.opType === "INSERT") {
          setMessage((message) => ({ ...message, ...msg.element }));
        }
      }
    );

    return subscription.unsubscribe;
  }, []);
  useEffect(() => {
    setAsRead();
  }, [isMe, message]);

  useEffect(() => {
    if (message.audio) {
      Storage.get(message.audio).then(setSoundURI);
    }
  }, [message]);

  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user.id === authUser.attributes.sub);
    };
    checkIfMe();
  }, [user]);

  const setAsRead = async () => {
    if (isMe === false && message.status != "READ") {
      await DataStore.save(
        MessageModel.copyOf(message, (updated) => {
          updated.status = "READ";
        })
      );
    }
  };

  if (!user) {
    return <ActivityIndicator />;
  }

  return (
    <Pressable onLongPress={setAsMessageReply}>
      <View
        style={[
          styles.container,
          isMe ? styles.rightContainer : styles.leftContainer,
          { width: soundURI ? "75%" : "auto" },
        ]}
      >
        {repliedTo && (
          <View>
            <Text
              style={{ marginHorizontal: 10, color: isMe ? "black" : "white" }}
            >
              In Reply to
            </Text>
            <MessageReply message={repliedTo} />
          </View>
        )}
        {message.image && (
          <S3Image
            imgKey={message.image}
            style={{
              width: width * 0.65,
              aspectRatio: 4 / 3,
              borderRadius: 10,
              marginBottom: 5,
            }}
            resizeMode="contain"
          />
        )}
        {soundURI && <AudioPlayer soundURI={soundURI} />}
        {!!message.content && (
          <Text
            style={{
              color: isMe ? "black" : "white",
            }}
          >
            {message.content}
          </Text>
        )}
        {isMe && !!message.status && message.status != "SENT" && (
          <Ionicons
            name={
              message.status == "DELIVERED" ? "checkmark" : "checkmark-done"
            }
            size={16}
            color="gray"
            style={{ marginHorizontal: 5 }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3777f0",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    maxWidth: "75%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  leftContainer: {
    backgroundColor: blue,
    marginLeft: 10,
    marginRight: "auto",
  },
  rightContainer: {
    backgroundColor: gray,
    marginLeft: "auto",
    marginRight: 10,
  },
});
