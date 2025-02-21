  import React, { useState } from 'react';
  import { View, Text, TextInput, Button,  FlatList, Picker, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
  import * as ImagePicker from 'expo-image-picker';
  import * as DocumentPicker from 'expo-document-picker';

  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { collection, addDoc } from 'firebase/firestore';
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
const [addingNewAccount, setAddingNewAccount] = useState(false);


    const categories = {
      Pays: ['Tunisie', 'France', 'Autriche', 'Amérique'],
      Salaire: ['Épargne', 'Frais'],
      Devise: ['Euro', 'Dollar', 'Dinar'],
    };
    const [selectedCategories, setSelectedCategories] = useState([{ category: 'Pays', subcategory: '' }]);

    const updateSubcategory = (index, subcategory) => {
      const newCategories = [...selectedCategories];
      newCategories[index].subcategory = subcategory;
      setSelectedCategories(newCategories);
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
      console.log("Navigating with company:", company); 
      if (!company) {
        console.error("Company is undefined!"); 
        return;
      }
      if (!amount || !selectedAccount || selectedCategories.some((item) => !item.subcategory) ) {
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

        setAmount("");
        setDescription("");
        setSelectedAccount("BIAT");
        setNewAccount("");

        router.replace(`/TransactionScreen?company=${company}`);
      } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Failed to save transaction');
      }
    };
  
 
    const handleAccountChange = (value) => {
      if (value === "+ Add New Account") {
        setAddingNewAccount(true);  // Show input field
      } else {
        setAddingNewAccount(false);
        setSelectedAccount(value);
      }
    };
    
    const addNewAccount = () => {
      if (newAccount.trim() !== "") {
        setAccounts([...accounts, newAccount]);  // Add new account
        setSelectedAccount(newAccount);  // Select the new account
        setNewAccount("");  // Clear input
        setAddingNewAccount(false);  // Hide input field
      }
    };
    



  const handleAddImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
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
      <View style={styles.assetItem}>
        <Text style={styles.assetText}>Image: {item}</Text>
      </View>
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

        {selectedCategories.map((item, index) => (
          <View key={index} style={styles.dropdownContainer}>
            <Text style={styles.label}>{item.category}:</Text>
            <Picker
              selectedValue={item.subcategory}
              style={styles.picker}
              onValueChange={(value) => updateSubcategory(index, value)}
            >
              <Picker.Item />
              {categories[item.category].map((subcategory, idx) => (
                <Picker.Item key={idx} label={subcategory} value={subcategory} />
              ))}
            </Picker>
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



<View>
  <Text>Account :</Text>
    <Picker style={styles.accountContainer}
      selectedValue={selectedAccount}
      onValueChange={handleAccountChange}
    >
      {accounts.map((account, index) => (
        <Picker.Item key={index} label={account} value={account} />
      ))}
      <Picker.Item label="+ Add New Account" value="+ Add New Account" />
    </Picker>

    {addingNewAccount && (
      <View>
        <TextInput
          style={{ borderBottomWidth: 1, marginVertical: 10, padding: 5 }}
          placeholder="Enter account name"
          value={newAccount}
          onChangeText={setNewAccount}
        />
        <Button title="Add" onPress={addNewAccount} />
      </View>
    )}
  </View>

        
       

 {/* Add Image and File Buttons */}
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
  });

  export default DepenseScreen;
