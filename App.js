import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { app } from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Import screen components
import AuthScreen from "./app/(tabs)/AuthScreen";
import PinScreen from "./app/(tabs)/PinScreen";
import CompanyScreen from "./app/(tabs)/CompanyScreen";
import TransactionScreen from "./app/(tabs)/TransactionScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth(app); 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "Company" : "Auth"}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Pin" component={PinScreen} />
        <Stack.Screen name="Company" component={CompanyScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
