import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

export type ThemedNumberInputProps = Omit<TextInputProps, "keyboardType"> & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedNumberInput({
  style,
  lightColor,
  darkColor,
  type = "default",
  value,
  onChangeText,
  ...rest
}: ThemedNumberInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const [internalValue, setInternalValue] = useState(value?.toString());

  return (
    <TextInput
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
      keyboardType="numeric"
      value={internalValue}
      onChangeText={(text) => {
        const parsed = parseInt(text);
        setInternalValue(text);
        if (!isNaN(parsed)) {
          onChangeText?.(text);
          return;
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
