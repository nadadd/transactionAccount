import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { auth } from "../../firebaseConfig"; 
import { useRouter } from "expo-router";

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        if (user) {
          router.replace("/(tabs)/PinScreen");
        } else {
          router.replace("/(tabs)/AuthScreen"); 
        }
        setLoading(false);
      },
      (error) => {
        console.error("Authentication Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Redirecting...</Text>
    </View>
  ); 
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
