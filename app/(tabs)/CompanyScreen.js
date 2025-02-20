import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';

const CompanyScreen = () => {
  const router = useRouter(); 
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [items, setItems] = useState([
    { label: 'iMaxeam', value: 'iMaxeam' },
    { label: 'Company B', value: 'Company B' },
    { label: 'Company C', value: 'Company C' }
  ]);

  const handleCompanySelect = (company) => {
    router.push(`/TransactionScreen?company=${company}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose company</Text>
      <DropDownPicker
  open={open}
  value={selectedCompany} 
  items={items}
  setOpen={setOpen}
  setValue={setSelectedCompany} 
  setItems={setItems}
  onSelectItem={(item) => {
    setSelectedCompany(item.value); 
    handleCompanySelect(item.value); 
  }}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
  },
});

export default CompanyScreen;
