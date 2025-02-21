import React, { useState } from "react";
import { View,Text, TextInput,Button,Alert,StyleSheet,ActivityIndicator} from "react-native";
import { useRouter } from "expo-router";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailValidError, setEmailValidError] = useState("");

  const handleValidEmail = (val) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

    if (reg.test(val) === false) {
      setEmailValidError("enter valid email address");
    } else if (reg.test(val) === true) {
      setEmailValidError("");
    }
  };

  const db = getFirestore();

  const sendPinToEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      await setDoc(doc(db, "pins", email), {
        pin: generatedPin,
        timestamp: serverTimestamp(),
      });
      console.log(`PIN sent to ${email}: ${generatedPin}`);

      router.push({
        pathname: "/PinScreen",
        params: { email },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to send PIN. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          handleValidEmail(text);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailValidError ? (
        <Text style={{ color: "red" }}>{emailValidError}</Text>
      ) : null}

      <Button title="Send PIN" onPress={sendPinToEmail} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});

export default AuthScreen;
