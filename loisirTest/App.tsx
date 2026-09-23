import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, Image } from "react-native";
import { ThemeProvider, useTheme } from "./src/screens/Settings/ThemeContext";
import { AuthProvider, AuthContext } from "./src/AuthContext"; // Importez AuthProvider et AuthContext

// Import des écrans d'authentification
import Start from "./src/screens/Authentification/Start";
import choisiType from "./src/screens/Authentification/choisiType";
import CreateAccountUser from "./src/screens/Authentification/CreateAccountUser";
import CreateAccountEntreprise from "./src/screens/Authentification/CreateAccountEntre";
import LoginScreen from "./src/screens/Authentification/LoginScreen";
import ResetPassword from "./src/screens/Authentification/ResetPassword";
import PasswordCode from "./src/screens/Authentification/PasswordCode";
import NewPassword from "./src/screens/Authentification/NewPassword";
import LoginE from "./src/screens/Authentification/LoginE";
import ResetPasswordE from "./src/screens/Authentification/ResetPasswordE";
import PasswordCodeE from "./src/screens/Authentification/PasswordCodeE";
import NewPasswordE from "./src/screens/Authentification/NewPasswordE";

// Import des écrans de profil
import ProfileUser from "./src/screens/Profil/profileUser";
import profileAdmin from "./src/screens/Profil/profileAdmin";
import profileEntrep from "./src/screens/Profil/profileEntrep";

// Import des écrans de contenu
import AddPost from "./src/screens/Post/AddPost";
import updatePost from "./src/screens/Post/updatePost";
import AddEvennement from "./src/screens/Evennement/AddEvennement";
import editEvenement from "./src/screens/Evennement/editEvenement";
import EventComponent from "./src/screens/Affichage/EventComponent";
import PostComponent from "./src/screens/Affichage/PostComponent";
import AddActivity from "./src/screens/Activity/AddActivity";
import CategoriesScreen from "./src/screens/Categories/CategoriesScreen";
import Hellopage1 from "./src/screens/HelloPage/Hellopage1";
import Hellopage2 from "./src/screens/HelloPage/Hellopage2";
import Acceuil from "./src/screens/Affichage/Acceuil";
import UpdateProfileUser from "./src/screens/Profil/UpdateProfileUser";
import UpdateProfilEntreprise from "./src/screens/Profil/UpdateProfilEntreprise";
import Post from "./src/screens/Post/Post";
import Event from "./src/screens/Evennement/Event";
import Activite from "./src/screens/Activity/Activite";
import UpdateActivite from "./src/screens/Activity/updateActivite";
import FlashSale from "./src/screens/Affichage/FlashSale";
import Settings from "./src/screens/Settings/Settings";
import Favores from "./src/screens/Affichage/Favores";
import ActivtyComponent from "./src/screens/Affichage/ActivtyComponent";
import ActivityDetailScreen from "./src/screens/Affichage/ActivityDetailScreen ";
import PostDetailScreen from "./src/screens/Affichage/PostDetailScreen ";
import EventDetailScreen from "./src/screens/Affichage/EventDetailScreen ";
import CategoryFilter from "./src/screens/Affichage/CategoryFilter";
import ProfileEntreprise from "./src/screens/Profil/profileEntrep";
import SelectInterests from './src/screens/Authentification/SelectInterests';

import ChoisiType from "./src/screens/Authentification/choisiType";
import CartScreen from "./src/screens/Reservation/CartScreen";
import ActivityReservationForm from "./src/screens/Reservation/ActivityReservationForm";
import CafeRestoReservationForm from "./src/screens/Reservation/CafeRestoReservationForm";
import HotelReservationForm from "./src/screens/Reservation/HotelReservationForm";
import ActivityReservationScreen from "./src/screens/Reservation/ActivityReservationScreen";
import CafeRestoReservationScreen from "./src/screens/Reservation/CafeRestoReservationScreen";
import HotelReservationScreen from "./src/screens/Reservation/HotelReservationScreen";
import CulturelleScreen from "./src/screens/Reservation/CulturelleScreen";
import JustForYou from "./src/screens/Affichage/JustForYou";
import NotificationScreen from './src/screens/Notifications/NotificationScreen';
import ConversationsScreen from './src/screens/conversation/ConversationsScreen';
import ChatScreen from './src/screens/conversation/ChatScreen';
import ConnectablesScreen from "./src/screens/conversation/ConnectablesScreen";
import FlouciKeysForm from "./src/screens/Authentification/FlouciKeysForm";
import ProfileEntrepriseVisite from "./src/screens/Profil/profileEntrpriseVisite";

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['PreventRemoveProvider']);


export const useAuth = () => useContext(AuthContext);
interface AuthContextProps {
  token: string | null;
  userType: string | null;
  isLoggedIn: boolean;
}

// Définition des navigateurs
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = () => {
  const { token, userType } = useContext(AuthContext) as unknown as AuthContextProps;

  if (!token) return <ChoisiType />;

  return userType === "user" ? <ProfileUser /> : <ProfileEntreprise />;
};

function BottomTabs() {
  const { isDarkMode } = useTheme();
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconSource;
          if (route.name === "Home") {
            iconSource = require('./src/screens/assets/home.png');
          } else if (route.name === "Favores") {
            iconSource = require('./src/screens/assets/favores.png');
          } else if (route.name === "Panier") {
            iconSource = require('./src/screens/assets/shopping-bag.png');
          } else if (route.name === "ChoisiTypeGroup") {
            iconSource = require('./src/screens/assets/list-text.png'); // Ajoutez une icône pour ce groupe
          }else if (route.name === "Profil") {
            iconSource = require('./src/screens/assets/user.png');
          }
          return <Image source={iconSource} style={{ width: size, height: size, tintColor: color }} />;
        },
        tabBarActiveTintColor: isDarkMode ? "#fff" : "#D7A738",
        tabBarInactiveTintColor: isDarkMode ? "#888" : "#8EB6AD",
        tabBarStyle: [styles.tabBar, isDarkMode && styles.tabBarDark],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        tabBarVisible: !['LoginScreen', 'CreateAccountUser', 'CreateAccountEntreprise', 'Hellopage1'].includes(route.name),
      })}
    >
           <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Favores" component={isLoggedIn ? Favores : choisiType} />
      <Tab.Screen name="Panier" component={CartScreen} /> 
      <Tab.Screen name="ChoisiTypeGroup" component={ChoisiTypeStack} options={{ title: "Choisi Type" }} />
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
}
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Acceuil" component={Acceuil} />
      <Stack.Screen name="ActivityComponent" component={ActivtyComponent} />
      <Stack.Screen name="ActivityDetailScreen" component={ActivityDetailScreen} />
      <Stack.Screen name="FlashSale" component={FlashSale} />
            <Stack.Screen name="postComponent" component={PostComponent} />
            <Stack.Screen name="eventComponent" component={EventComponent} />
            <Stack.Screen name="EventDetailScreen" component={EventDetailScreen} />
            <Stack.Screen name="Event" component={Event} />
            <Stack.Screen name="JustForYou" component={JustForYou} />
          
    </Stack.Navigator>
  );
};
const ChoisiTypeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="choisiType" component={choisiType} />
      <Stack.Screen name="SelectInterests" component={SelectInterests} />
      <Stack.Screen name="HelloPage1" component={Hellopage1} />
      <Stack.Screen name="HelloPage2" component={Hellopage2} />
    </Stack.Navigator>
  );
};
// const ProfileStack = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="ProfileUser" component={ProfileUser} /> 
//   <Stack.Screen name="ProfileEntrep" component={profileEntrep} /> 
//   <Stack.Screen name="CreateAccountUser" component={CreateAccountUser} />
//             <Stack.Screen name="CreateAccountEntreprise" component={CreateAccountEntreprise} />
//             <Stack.Screen name="LoginE" component={LoginE} />
           
//     </Stack.Navigator>
//   );
// };
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
          
            <Stack.Screen name="Home" component={BottomTabs} />
            <Stack.Screen name="Start" component={Start} />
            <Stack.Screen name="choisiType" component={choisiType} />
            <Stack.Screen name="CreateAccountUser" component={CreateAccountUser} />
            <Stack.Screen name="CreateAccountEntreprise" component={CreateAccountEntreprise} />
          
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="PasswordCode" component={PasswordCode} />
            <Stack.Screen name="NewPassword" component={NewPassword} />
            <Stack.Screen name="LoginE" component={LoginE} />
            <Stack.Screen name="ResetPasswordE" component={ResetPasswordE} />
            <Stack.Screen name="PasswordCodeE" component={PasswordCodeE} />
            <Stack.Screen name="NewPasswordE" component={NewPasswordE} />
            <Stack.Screen name="HelloPage1" component={Hellopage1} />
            <Stack.Screen name="HelloPage2" component={Hellopage2} />
            <Stack.Screen name="SelectInterests" component={SelectInterests} />
            <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
        <Stack.Screen name="profileEntrpriseVisite" component={ProfileEntrepriseVisite} />
         <Stack.Screen
              name="NotificationScreen"
              component={NotificationScreen}
              options={{
                title: 'Notifications',
                headerStyle: {
                  backgroundColor: '#4A7C87',
                },
                headerTintColor: '#fff',
              }}
            />   
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Acceuil" component={Acceuil} />
            <Stack.Screen name="AddActivity" component={AddActivity} />
            <Stack.Screen name="Activite" component={Activite} />
            <Stack.Screen name="ActivityDetailScreen" component={ActivityDetailScreen} />
            <Stack.Screen name="updateActivite" component={UpdateActivite} />
            <Stack.Screen name="ActivityComponent" component={ActivtyComponent} />
            <Stack.Screen name="profileUser" component={ProfileUser} />
            <Stack.Screen name="profileEntrep" component={profileEntrep} />
            <Stack.Screen name="UpdateProfilEntreprise" component={UpdateProfilEntreprise} />
            <Stack.Screen name="UpdateProfileUser" component={UpdateProfileUser} />
            <Stack.Screen name="profileAdmin" component={profileAdmin} />
            <Stack.Screen name="FlashSale" component={FlashSale} />
            <Stack.Screen name="postComponent" component={PostComponent} />
            <Stack.Screen name="eventComponent" component={EventComponent} />
            <Stack.Screen name="AddPost" component={AddPost} />
            <Stack.Screen name="Post" component={Post} />
            <Stack.Screen name="updatePost" component={updatePost} />
            <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
            <Stack.Screen name="AddEvennement" component={AddEvennement} />
            <Stack.Screen name="editEvenement" component={editEvenement} />
            <Stack.Screen name="EventDetailScreen" component={EventDetailScreen} />
            <Stack.Screen name="Event" component={Event} />
            <Stack.Screen name="Favores" component={Favores} />
            <Stack.Screen name="CategoryFilter" component={CategoryFilter} />
            <Stack.Screen name="CartScreen" component={CartScreen} />
            <Stack.Screen name="ActivityReservationScreen" component={ActivityReservationScreen} />
            <Stack.Screen name="CafeRestoReservationScreen" component={CafeRestoReservationScreen} />
            <Stack.Screen name="HotelReservationScreen" component={HotelReservationScreen} />
            <Stack.Screen name="CulturelleScreen" component={CulturelleScreen} />
            <Stack.Screen name="JustForYou" component={JustForYou} />
          
            <Stack.Screen name="Conversations" component={ConversationsScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ConnectablesScreen" component={ConnectablesScreen} />
        <Stack.Screen name="FlouciKeysForm" component={FlouciKeysForm} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: 75,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Effet verre
    borderTopColor: "transparent",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 15,
    borderTopWidth: 0,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarDark: {
    backgroundColor: "rgba(30, 30, 30, 0.85)", // Noir translucide
    borderTopColor: "transparent",
    shadowColor: "#fff",
    shadowOpacity: 0.05,
  },
});