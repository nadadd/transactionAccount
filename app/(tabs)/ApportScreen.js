// Apports.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const Apports = () => {
  const router = useRouter();
  const {company} = useLocalSearchParams();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState("");
  const [imageAssets, setImageAssets] = useState([]);
  const [fileAssets, setFileAssets] = useState([]);
  const [accounts, setAccounts] = useState(["ATB", "BNA", "UBCI"]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [newAccount, setNewAccount] = useState("");
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [addingNewAccount, setAddingNewAccount] = useState(false);
  const [bilan, setBilan] = useState("Bilan");
  const [caisse, setCaisse] = useState("Caisse");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [bilanModalVisible, setBilanModalVisible] = useState(false);
  const [caisseModalVisible, setCaisseModalVisible] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      const transactionsCollection = collection(db, "transactions");
      const q = query(transactionsCollection, where("company", "==", company));
      const querySnapshot = await getDocs(q);

      let balance = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === "apport") {
          balance += data.amount;
        } else if (data.type === "depense") {
          balance -= data.amount;
        }
      });
      setCurrentBalance(balance);
    };

    fetchBalance();
  }, [company]);

  const handleSave = async () => {
    if (!amount || !selectedAccount) {
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
      setSelectedAccount(accounts[0]);
      setNewAccount("");
      setBilan("Bilan");
      setCaisse("Caisse");
      router.push(`/TransactionScreen?company=${company}`);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction");
    }
  };

  const handleAddAccount = () => {
    if (newAccount.trim() !== "") {
      setAccounts([...accounts, newAccount]);
      setSelectedAccount(newAccount);
      setNewAccount("");
      setAddingNewAccount(false);
      setAccountModalVisible(false);
    }
  };

  const handleAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageAssets((prevAssets) => [...prevAssets, result.assets[0].uri]);
    }
  };

  const handleAddFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: false,
    });
    if (result.type === 'success') {
      setFileAssets((prevAssets) => [...prevAssets, result.uri]);
    }
  };

  const renderImageAssets = ({ item }) => (
    <Image source={{ uri: item }} style={{ width: 150, height: 150, margin: 5 }} />
  );

  const renderFileAssets = ({ item }) => (
    <View style={styles.assetItem}>
      <Text style={styles.assetText}>File: {item}</Text>
    </View>
  );

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

      {/* Account Dropdown */}
      <View>
        <Text>Account:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setAccountModalVisible(true)}
        >
          <Text>{selectedAccount}</Text>
        </TouchableOpacity>

        <Modal
          visible={accountModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Account</Text>
                <TouchableOpacity onPress={() => setAccountModalVisible(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              {accounts.map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedAccount(account);
                    setAccountModalVisible(false);
                  }}
                >
                  <Text>{account}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => setAddingNewAccount(true)}
              >
                <Text style={styles.addButtonText}>+ Add New Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {addingNewAccount && (
          <View>
            <TextInput
              style={styles.newAccountInput}
              placeholder="Enter account name"
              value={newAccount}
              onChangeText={setNewAccount}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Finance Section */}
      <View style={styles.financeContainer}>
        <Text style={styles.financetext}><Text style={styles.bold}>Finance</Text></Text>
        <Text>Débit</Text>
        <View style={styles.financeRow}>
          {/* Bilan Dropdown */}
          <TouchableOpacity
            style={[styles.dropdown, { flex: 1, marginRight: 10 }]}
            onPress={() => setBilanModalVisible(true)}
          >
            <Text>{bilan}</Text>
          </TouchableOpacity>

          <Modal
            visible={bilanModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Bilan</Text>
                  <TouchableOpacity onPress={() => setBilanModalVisible(false)}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                {['Bilan', 'Option 2'].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItem}
                    onPress={() => {
                      setBilan(option);
                      setBilanModalVisible(false);
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          {/* Caisse Dropdown */}
          <TouchableOpacity
            style={[styles.dropdown, { flex: 1 }]}
            onPress={() => setCaisseModalVisible(true)}
          >
            <Text>{caisse}</Text>
          </TouchableOpacity>

          <Modal
            visible={caisseModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Caisse</Text>
                  <TouchableOpacity onPress={() => setCaisseModalVisible(false)}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                {['Caisse', 'Option B'].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItem}
                    onPress={() => {
                      setCaisse(option);
                      setCaisseModalVisible(false);
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        </View>

        <Text style={styles.balance}>{currentBalance}</Text>
      </View>

      {/* Asset Buttons */}
      <View style={styles.assetButtonsContainer}>
        <TouchableOpacity onPress={handleAddImage} style={styles.assetButton}>
          <Text style={styles.assetButtonText}>📸 Add Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddFile} style={styles.assetButton}>
          <Text style={styles.assetButtonText}>📁 Add File</Text>
        </TouchableOpacity>
      </View>

      {/* Image Carousel */}
      <FlatList
        data={imageAssets}
        renderItem={renderImageAssets}
        keyExtractor={(item, index) => `image-${index}`}
        horizontal
        style={styles.assetCarousel}
      />

      {/* File Carousel */}
      <FlatList
        data={fileAssets}
        renderItem={renderFileAssets}
        keyExtractor={(item, index) => `file-${index}`}
        horizontal
        style={styles.assetCarousel}
      />

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdown: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  assetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 40,
  },
  assetButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  assetButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  assetCarousel: {
    marginVertical: 10,
  },
  assetItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  assetText: {
    fontSize: 14,
    color: '#333',
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

  financetext :{
    fontSize: 18,
    marginBottom: 10,
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
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  financeContainer: { marginTop: 40 },
  financeRow: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  financePicker: { flex: 1, marginRight: 10 },
  balance: {padding: 15, marginLeft: 30, backgroundColor: '#ccc'},
});

export default Apports;
