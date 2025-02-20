import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, where,orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const TransactionScreen = () => {
  const router = useRouter();
  const { company } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    console.log("Company:", company);
    if (!company) return;
    const transactionsCollection = collection(db, 'transactions');
    const q = query(
      transactionsCollection,
      where('company', '==', company), 
     orderBy('date', 'desc') ,
      );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(fetchedTransactions);
    });

    return () => unsubscribe();
  }, [company]);

  const filteredTransactions = transactions.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase())
  );

 const formatDate = (dateInput) => {
  if (typeof dateInput === 'string') {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Formatted as DD/MM/YYYY
  } else if (dateInput && dateInput.seconds) {
    const date = new Date(dateInput.seconds * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Formatted as DD/MM/YYYY
  }
  return 'Unknown Date';
};

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{company}</Text>
        <TouchableOpacity onPress={() => router.push('/CompanyScreen')}>
          <Text style={styles.switchText}>Switch Company</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search Transaction..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.transactionRow, item.type === 'apport' ? styles.apport : styles.depense]}>
            <View style={styles.transactionDetails}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>
              <Text style={styles.transactionDescription}>{item.description}</Text>
            </View>
            <Text style={styles.transactionAmount}>{item.amount.toFixed(3)}</Text>
          </View>
        )}
        ItemSeparatorComponent={renderSeparator} 
      />

      <View style={styles.buttonContainer}>
        <Button title="+" onPress={() => router.push(`/ApportScreen?company=${company}`)} />
        <Button title="-" onPress={() => router.push(`/DepenseScreen?company=${company}`)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  switchText: {
    fontSize: 18,
    fontWeight: '300',
    color: 'blue',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  transactionDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dateContainer: {
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  transactionDescription: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    opacity: 0.5,
    marginVertical: 5, 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  apport: {
    backgroundColor: '#c8e6c9', 
  },
  depense: {
    backgroundColor: '#ffcdd2', 
  },
});

export default TransactionScreen;
