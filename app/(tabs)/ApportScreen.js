import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const Apports = () => {
  const router = useRouter();
  const {company} = useLocalSearchParams();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("BIAT");
  const [newAccount, setNewAccount] = useState("");
  const accounts = ["BIAT", "ATB"];

  const handleSave = async () => {
    if (!amount && !selectedAccount) {
      alert("Please fill all fields");
      return;
    }

    try {
      const transactionsCollection = collection(db, "transactions");
      await addDoc(transactionsCollection, {
        amount: parseFloat(amount),
        date,
        description,
        account: selectedAccount,
        company,
        type: "apport",
      }); 
      alert("Transaction saved successfully!");

      setAmount("");
      setDescription("");
      setSelectedAccount("BIAT");
      setNewAccount("");

      router.push(`/TransactionScreen?company=${company}`);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <TouchableOpacity style={styles.closeButton} onPress={() => router.push(`/TransactionScreen?company=${company}`)}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerText}>Apports</Text>
      </View>

      <TextInput
        style={styles.amountInput}
        placeholder="0.000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <TextInput
        style={styles.descriptionInput}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#999"
      />

      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedAccount}
          onValueChange={(itemValue) => setSelectedAccount(itemValue)}
          style={styles.dropdown}
        >
          {accounts.map((account, index) => (
            <Picker.Item key={index} label={account} value={account} />
          ))}
          <Picker.Item label="Add New Account..." value="add" />
        </Picker>
      </View>

      {selectedAccount === "add" && (
        <TextInput
          style={styles.newAccountInput}
          placeholder="Enter new account name"
          value={newAccount}
          onChangeText={setNewAccount}
          placeholderTextColor="#999"
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    marginBottom: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  amountInput: {
    height: 80,
    fontSize: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  dateContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  descriptionInput: {
    height: 50,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "#333",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    width: "100%",
  },
  newAccountInput: {
    height: 50,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Apports;
