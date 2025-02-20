import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import { getFormattedDate, hp } from "@/helpers/common";
import Avatar from "./Avatar";
import Icon from "@/assets/icons";
import { Comment } from "@/services/postService";

export interface CommentItemProps {
  comment: Comment;
  isCommentOwner?: boolean;
  removingComment: (item: any) => void;
  hightLight?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isCommentOwner = false,
  removingComment,
  hightLight = false,
}) => {
  const onRemoveComment = (item: any) => {
    Alert.alert("Warning", "This comment will be deleted forever!", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => removingComment(item),
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Avatar uri={comment.user.image} />
      <View style={[styles.content, hightLight ? styles.highlight : null]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={styles.nameContainer}>
            <Text style={styles.text}>{comment.user.name}</Text>
            <Text>•</Text>
            <Text style={[styles.text, { color: theme.colors.textLight }]}>
              {getFormattedDate(comment.created_at)}
            </Text>
          </View>
          {isCommentOwner && (
            <TouchableOpacity onPress={() => onRemoveComment(comment)}>
              <Icon name="delete" size={20} color={theme.colors.rose} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.text, { fontWeight: "normal" }]}>
          {comment.text}
        </Text>
      </View>
    </View>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
  },
  content: {
    backgroundColor: "rgba(0,0,0,0.06)",
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderCurve: "continuous",
  },
  highlight: {
    borderWidth: 0.2,
    backgroundColor: "white",
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
});
