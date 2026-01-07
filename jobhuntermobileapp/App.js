import React, { useContext, useReducer, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Cần cài đặt thư viện này

// --- Context & Reducer ---
import { MyUserContext } from "./utils/contexts/MyUserContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";

// --- Screens ---
import Welcome from "./screens/Welcome/Welcome";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import Home from "./screens/Applicant/Home";
import JobDetail from "./screens/Applicant/JobDetail";
import Activity from "./screens/Applicant/MyApplications";
import Profile from "./screens/User/Profile";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const JobSearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={Home} options={{ title: "Việc làm nổi bật", headerShown: false }} />
    <Stack.Screen name="JobDetail" component={JobDetail} options={{ title: "Chi tiết công việc" }} />
    <Stack.Screen name="Profile" component={Profile} options={{ title: "Cá nhân" }} />
  </Stack.Navigator>
);

const ActivityStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ActivityList" component={Activity} options={{ title: "Hoạt động", headerShown: false }} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const [user] = useContext(MyUserContext);
  const activeColor = "#1976D2";

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: activeColor, headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={JobSearchStack}
        options={{
          title: user?.role === "RECRUITER" ? "Tuyển dụng" : "Tìm việc",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="briefcase-search" size={26} color={color} />
        }}
      />

        <Tab.Screen
          name="ActivityTab"
          component={ActivityStack}
          options={{
            title: user?.role === "RECRUITER" ? "Ứng viên" : "Hồ sơ đã nộp",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-multiple" size={26} color={color} />
          }}
        />

      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" size={26} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Screen name="Home" component={TabNavigator} />
            ) : (
              <>
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Login" component={Login} options={{ headerShown: true, title: "Đăng nhập" }} />
                <Stack.Screen name="Register" component={Register} options={{ headerShown: true, title: "Đăng ký" }} />
                <Stack.Screen name="Home" component={TabNavigator} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </MyUserContext.Provider>
  );
};

export default App;