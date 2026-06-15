import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Animated,
  Easing,
  View, ViewStyle
} from "react-native";

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function Button({ title, loading, disabled, style, ...rest }: Props) {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const flatStyle = StyleSheet.flatten([styles.container, style]) as ViewStyle;
  const borderRadius = flatStyle?.borderRadius ?? 12;
  
  const paddingHorizontal = flatStyle?.paddingHorizontal ?? 0;
  const paddingVertical = flatStyle?.paddingVertical ?? 0;


  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotationAnim.setValue(0);
    }
  }, [loading]);

  const rotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bolinhas = Array.from({ length: 8 });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...rest}
    >
      <LinearGradient
        colors={["#007BFF", "#00D2B4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient,
          { borderRadius , paddingHorizontal, paddingVertical }, // ← passa o borderRadius para o gradiente
          (disabled || loading) && { opacity: 0.6 }]}
      >
        {loading ? (
          <Animated.View
            style={[styles.circlesContainer, { transform: [{ rotate }] }]}
          >
            {bolinhas.map((_, index) => {
              const angulo = (index * 45 * Math.PI) / 180;
              const raio = 11;
              const x = raio * Math.cos(angulo);
              const y = raio * Math.sin(angulo);

              const tamanho = 3.5 + index * 0.4;
              const opacidade = 0.2 + index * 0.1;

              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: tamanho,
                      height: tamanho,
                      borderRadius: tamanho / 2,
                      opacity: opacidade,
                      transform: [{ translateX: x }, { translateY: y }],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 25,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  circlesContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dot: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
  },
});
