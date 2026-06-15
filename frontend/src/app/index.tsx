import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      const storedUser = await AsyncStorage.getItem("@Questio:user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;
      const tipo = user?.tipoUsuario;

      if (!token) {
        router.replace("/screens/(Authenticator)/Login");
        return;
      }

      if (tipo === "Aluno") {
        router.replace("/screens/(Aluno)/Home");
      } else if (tipo === "Professor") {
        router.replace("/screens/(Professor)/Home");
      } else if (tipo === "Coordenacao") {
        router.replace("/screens/(Coordenador)/Home");
      } else {
        router.replace("/screens/(Authenticator)/Login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <Image
          source={require("../../assets/icon_questio.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity }}>
        <MaskedView
          style={styles.maskedView}
          maskElement={
            <Text
              style={[styles.TituloLogo, { backgroundColor: "transparent" }]}
            >
              Questio
            </Text>
          }
        >
          <LinearGradient
            colors={["#00d2b4", "#007BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </MaskedView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  maskedView: {
    width: 300,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  TituloLogo: {
    color: "#ffffff",
    fontSize: 50,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 2,
  },
});
