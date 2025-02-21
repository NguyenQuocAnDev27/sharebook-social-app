import { StyleSheet, View, Text } from "react-native";
import React, { useRef } from "react";
import {
  actions,
  IconRecord,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";
import { hp } from "@/helpers/common";
import { theme } from "@/constants/theme";

interface RichTextEditorProps {
  editorRef: React.RefObject<any>;
  onChange: (body: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  editorRef = null,
  onChange,
}) => {
  return (
    <View style={{ minHeight: 285 }}>
      {/* RichToolbar component */}
      <RichToolbar
        actions={[
          actions.setStrikethrough,
          actions.removeFormat,
          actions.insertImage,
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading4,
        ]}
        iconMap={{
          [actions.heading1]: ({ tintColor }: IconRecord) => (
            <Text style={[styles.tib, { color: tintColor }]}>H1</Text>
          ),
          [actions.heading4]: ({ tintColor }: IconRecord) => (
            <Text style={[styles.tib, { color: tintColor }]}>H4</Text>
          ),
        }}
        style={styles.richBar}
        flatContainerStyle={styles.flatListStyle}
        selectedIconTint={theme.colors.primaryDark}
        editor={editorRef}
        disable={false}
      />

      {/* RichEditor component */}
      <RichEditor
        ref={editorRef}
        containerStyle={styles.richEditor}
        editorStyle={{
          color: theme.colors.text,
          placeholderColor: "gray",
        }}
        placeholder={"Write your thoughts here..."}
        onChange={onChange}
      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  richBar: {
    borderTopRightRadius: theme.radius.xl,
    borderTopLeftRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray,
  },
  richEditor: {
    minHeight: 240,
    flex: 1,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    borderColor: theme.colors.gray,
    padding: 5,
  },
  flatListStyle: {
    paddingHorizontal: 8,
    gap: 3,
  },
  tib: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
  },
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
  }
});
