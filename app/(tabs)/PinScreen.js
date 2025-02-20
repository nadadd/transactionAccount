import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const PinScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [pin, setPin] = useState("");
  const db = getFirestore();

  const handlePinSubmit = async () => {
    if (!pin) {
      Alert.alert("Error", "Please enter a PIN.");
      return;
    }

    try {
      const pinDoc = await getDoc(doc(db, "pins", email));
      if (!pinDoc.exists()) {
        Alert.alert("Error", "No PIN found for this email.");
        return;
      }

      const storedPin = pinDoc.data().pin;

      if (pin === storedPin) {
        Alert.alert("Success", "PIN verified!");
        router.replace("/CompanyScreen"); // Redirect to the main app
      } else {
        Alert.alert("Invalid PIN", "The PIN you entered is incorrect.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify PIN. Please try again.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your PIN</Text>
      <TextInput
        style={styles.pinInput}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handlePinSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pinInput: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    textAlign: "center",
    fontSize: 24,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
    marginBottom: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    color: "#007bff",
    fontSize: 16,
  },
});

export default PinScreen;
