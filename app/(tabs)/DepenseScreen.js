import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DepenseScreen = () => {
  const router = useRouter();
  const {company} = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState('');
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
  
  const categories = {
    Pays: ['Tunisie', 'France', 'Amérique'],
    Salaire: ['Épargne', 'Frais'],
    Devise: ['Euro', 'Dollar', 'Dinar'],
  };
  const [selectedCategories, setSelectedCategories] = useState([{ category: 'Pays', subcategory: '' }]);
  const [categoryModals, setCategoryModals] = useState({});

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

  const updateSubcategory = (index, subcategory) => {
    const newCategories = [...selectedCategories];
    newCategories[index].subcategory = subcategory;
    setSelectedCategories(newCategories);
    setCategoryModals({ ...categoryModals, [index]: false });
  };

  const addCategory = () => {
    const availableCategories = Object.keys(categories).filter(
      (cat) => !selectedCategories.some((selected) => selected.category === cat)
    );

    if (availableCategories.length > 0) {
      setSelectedCategories([...selectedCategories, { category: availableCategories[0], subcategory: '' }]);
    } else {
      alert('No more categories available');
    }
  };

  const handleSave = async () => {
    if (!amount || !selectedAccount || selectedCategories.some((item) => !item.subcategory)) {
      alert('Please fill all fields');
      return;
    }
    try {
      const transactionsCollection = collection(db, 'transactions');
      await addDoc(transactionsCollection, {
        amount: parseFloat(amount),
        date,
        description,
        account: selectedAccount,
        categories: selectedCategories.map((item) => ({
          category: item.category,
          subcategory: item.subcategory,
        })),
        company,
        type: 'depense',
      });
      alert('Transaction saved successfully!');
      router.replace(`/TransactionScreen?company=${company}`);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
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

  // Rest of your existing image and file handling functions...

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.push(`/TransactionScreen?company=${company}`)}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerText}>Depenses</Text>
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

      {/* Categories Section */}
      {selectedCategories.map((item, index) => (
        <View key={index} style={styles.dropdownContainer}>
          <Text style={styles.label}>{item.category}:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCategoryModals({ ...categoryModals, [index]: true })}
          >
            <Text>{item.subcategory || `Select ${item.category}`}</Text>
          </TouchableOpacity>

          <Modal
            visible={categoryModals[index] || false}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select {item.category}</Text>
                  <TouchableOpacity onPress={() => setCategoryModals({ ...categoryModals, [index]: false })}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                {categories[item.category].map((subcategory, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalItem}
                    onPress={() => updateSubcategory(index, subcategory)}
                  >
                    <Text>{subcategory}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        </View>
      ))}

      {Object.keys(categories).length > selectedCategories.length && (
        <TouchableOpacity style={styles.addButton} onPress={addCategory}>
          <Text style={styles.addButtonText}>+ Add Subcategory</Text>
        </TouchableOpacity>
      )}

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
            <Button title="Add" onPress={handleAddAccount} />
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

      {/* Your existing image and file sections... */}

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
      backgroundColor: '#f8f9fa',
    },
    accountContainer: {
      padding: 15,
    },
    assetButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      marginTop: 40,
    },
    assetButton: {
      padding: 15,
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
      fontWeight: 'bold',
      color: '#333',
    },
    amountInput: {
      height: 80,
      fontSize: 40,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 20,
      textAlign: 'center',
      color: '#333',
    },
    dateContainer: {
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 20,
    },
    dateText: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
    },
    dropdownContainer: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 15,
    },
    picker: {
      height: 50,
      width: '100%',
    },
    descriptionInput: {
      height: 50,
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 20,
      paddingHorizontal: 10,
      color: '#333',
    },
    newAccountInput: {
      height: 50,
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 20,
      paddingHorizontal: 10,
      color: '#333',
    },
    companyInput: {  
      height: 50,
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 20,
      paddingHorizontal: 10,
      color: '#333',
    },
    addButton: {
      backgroundColor: '#28a745',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 20,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#28a745',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
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
    financeContainer: { marginTop: 40 },
  financeRow: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  financePicker: { flex: 1, marginRight: 10 },
  balance: {padding: 15, marginLeft: 30, backgroundColor: '#ccc'},
  });

  export default DepenseScreen;
