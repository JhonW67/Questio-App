import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";

interface RadioSelectProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function RadioSelect({ options, selected, onChange }: RadioSelectProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de Conta</Text>

      <View style={styles.radioContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.radioOption}
            activeOpacity={0.7}
            onPress={() => onChange(option)}
          >
            <View
              style={[
                styles.radioCircle,
                selected === option && styles.radioCircleSelected,
              ]}
            >
              {selected === option && <View style={styles.radioInnerCircle} />}
            </View>

            <Text
              style={[
                styles.radioText,
                selected === option && styles.radioTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
export const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    color: "#7a869a",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1a2433",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: "#00d2b4",
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#00d2b4",
  },
  radioText: {
    color: "#7a869a",
    fontSize: 14,
  },
  radioTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
