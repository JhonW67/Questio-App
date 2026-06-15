import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Modal, Animated, Easing, Text } from "react-native";

interface ScreenLoaderProps {
  visible: boolean;
  message?: string;
}

export function ScreenLoader({ visible, message }: ScreenLoaderProps) {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  const rotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bolinhas = Array.from({ length: 8 });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.loaderBox}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]}>
            {bolinhas.map((_, index) => {
              const angulo = (index * 45 * Math.PI) / 180;
              const raio = 16;
              const x = raio * Math.cos(angulo);
              const y = raio * Math.sin(angulo);

              const tamanho = 4 + index * 0.6;
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
          {message && <Text style={styles.loadingText}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(5, 14, 29, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dot: {
    backgroundColor: "#00d2b4",
    position: "absolute",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24, // Espaçamento abaixo das bolinhas girando
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
