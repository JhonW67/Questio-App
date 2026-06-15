import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  iconName,
  isPassword,
  rightElement,
  ...rest
}: InputProps) {
  const [secure, setSecure] = useState(!!isPassword);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Se for multiline, aumenta a altura para 120, alinha itens no topo e joga um padding superior */}
      <View
        style={[
          styles.inputWrapper,
          rest.multiline && {
            height: 120,
            alignItems: "flex-start",
            paddingTop: 16,
          },
        ]}
      >
        <Feather
          name={iconName}
          size={20}
          color="#555"
          // Se for multiline, empurra o ícone de leve para baixo para alinhar com a primeira linha de texto
          style={[styles.iconLeft, rest.multiline && { marginTop: 2 }]}
        />

        <TextInput
          style={[
            styles.input,
            // Se for multiline, força o alinhamento do placeholder e texto no topo esquerdo absoluto
            rest.multiline && { textAlignVertical: "top", height: "100%" },
          ]}
          placeholderTextColor="#555"
          secureTextEntry={secure}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setSecure(!secure)}
            style={styles.iconRight}
          >
            <Feather name={secure ? "eye-off" : "eye"} size={20} color="#555" />
          </TouchableOpacity>
        ) : (
          rightElement && (
            <View
              style={[styles.iconRight, rest.multiline && { marginTop: 2 }]}
            >
              {rightElement}
            </View>
          )
        )}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    color: "#7a869a",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    width: "100%",
    height: 56,
    backgroundColor: "#0a121f",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1a2433",
    paddingHorizontal: 14,
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    height: "100%",
  },
  iconRight: {
    marginLeft: 10,
  },
});
