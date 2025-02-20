  import React, { useState, useEffect } from 'react';
  import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
  import { Picker } from '@react-native-picker/picker';
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { collection, addDoc } from 'firebase/firestore';
  import { db } from '../../firebaseConfig';

  const DepenseScreen = () => {
    const router = useRouter();
    const {company} = useLocalSearchParams();
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString());
    const [description, setDescription] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('BIAT');
    const [newAccount, setNewAccount] = useState('');

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
    useEffect(() => {
      console.log("Company state updated:", company);
    }, [company]);
    
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

        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedAccount}
            onValueChange={(itemValue) => setSelectedAccount(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="BIAT" value="BIAT" />
            <Picker.Item label="ATB" value="ATB" />
            <Picker.Item label="Add New Account..." value="add" />
          </Picker>
        </View>

        {selectedAccount === 'add' && (
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
      backgroundColor: '#f8f9fa',
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
      backgroundColor: '#007bff',
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
