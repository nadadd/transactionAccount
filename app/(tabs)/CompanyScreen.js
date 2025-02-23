import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const CompanyScreen = () => {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState('iMaxeam');

  const companies = [
    { label: 'iMaxeam', value: 'iMaxeam' },
    { label: 'Company B', value: 'Company B' },
    { label: 'Company C', value: 'Company C' }
  ];

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    router.push(`/TransactionScreen?company=${company}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose company</Text>
      <View style={styles.buttonContainer}>
        {companies.map((company) => (
          <Pressable
            key={company.value}
            style={[
              styles.button,
              selectedCompany === company.value && styles.selectedButton
            ]}
            onPress={() => handleCompanySelect(company.value)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedCompany === company.value && styles.selectedButtonText
              ]}
            >
              {company.label}
            </Text>
          </Pressable>
        ))}
      </View>
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
  buttonContainer: {
    width: '80%',
    gap: 10,
  },
  button: {
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  selectedButtonText: {
    color: '#fff',
  },
});

export default CompanyScreen;