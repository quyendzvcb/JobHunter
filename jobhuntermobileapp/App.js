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
import Activity from "./screens/Home/Activity";
import Profile from "./screens/User/Profile";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import JobDetail from "./screens/Home/JobDetail";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const [user,] = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#d32f2f' }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="briefcase-search" size={26} color={color} />
        }}
      />

      <Tab.Screen
        name="Activity"
        component={Activity}
        options={{
          title: user?.role === 'RECRUITER' ? "Ứng viên" : "Hồ sơ",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-multiple" size={26} color={color} />
        }}
      />

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

            {/* LOGIC ĐIỀU HƯỚNG DỰA TRÊN TRẠNG THÁI LOGIN */}
            {user === null ? (
              // NHÓM 1: Các màn hình chỉ hiện khi CHƯA đăng nhập
              <>
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Login" component={Login} options={{ headerShown: true, title: "Đăng nhập" }} />
                <Stack.Screen name="Register" component={Register} options={{ headerShown: true, title: "Đăng ký" }} />
              </>
            ) : (
              // NHÓM 2: Khi ĐÃ đăng nhập, nhóm 1 biến mất, MainApp trở thành màn hình đầu tiên (Home)
              // Bạn có thể để trống ở đây nếu MainApp luôn được render ở dưới
              <></>
            )}

            {/* MainApp luôn có sẵn trong Stack. 
               - Nếu user chưa login: Nó nằm sau Welcome/Login.
               - Nếu user đã login: Welcome/Login biến mất, MainApp tự động được đẩy lên đầu (Trang chủ).
            */}
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen name="JobDetail" component={JobDetail} options={{ headerShown: true, title: "Chi tiết việc làm" }} />

          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </MyUserContext.Provider>
  );
}

export default App;