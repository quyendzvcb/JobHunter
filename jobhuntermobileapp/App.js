import React, { useReducer, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MyUserContext } from "./utils/contexts/MyUserContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";

import Welcome from "./screens/Welcome/Welcome";
import Home from "./screens/Home/Home";
import Activity from "./screens/Home/Activity"; // Import file mới
import Profile from "./screens/User/Profile";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import JobDetails from "./screens/Home/JobDetail";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  // Lấy user từ context để check role nếu muốn hiển thị tên Tab khác nhau
  const [user] = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#d32f2f' }}>
      {/* Tab 1: Trang chủ / Việc làm */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="briefcase-search" size={26} color={color} />
        }}
      />

      {/* Tab 2: Activity (Thay thế Companies) - Đây là phần NTD -> ƯV */}
      <Tab.Screen
        name="Activity"
        component={Activity}
        options={{
          title: user?.role === 'RECRUITER' ? "Ứng viên" : "Hồ sơ", // Đổi tên tab linh hoạt
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-multiple" size={26} color={color} />
        }}
      />

      {/* Tab 3: Tài khoản */}
      <Tab.Screen
        name="Account"
        component={Profile}
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={26} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen name="JobDetails" component={JobDetails} options={{ headerShown: true, title: "Chi tiết việc làm" }} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: true, title: "" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </MyUserContext.Provider>
  );
}

export default App;