import React, { useContext, useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

// --- Context & Reducer ---
import { MyUserContext } from "./utils/contexts/MyUserContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";

// --- Screens ---
import Welcome from "./screens/Welcome/Welcome";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import ApplicantHome from "./screens/Applicant/ApplicantHome";
import JobDetail from "./screens/Applicant/JobDetail";
import Profile from "./screens/User/Profile";
import ApplyJob from "./screens/Applicant/ApplyJob";
import MyApplications from "./screens/Applicant/MyApplications";
import RecruiterHome from "./screens/Recruiter/RecruiterHome";
import JobEditor from "./screens/Recruiter/JobEditor";
import AddJob from "./screens/Recruiter/AddJob";
import ApplicationDetail from "./screens/Recruiter/ApplicationDetail"

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- CÁC STACK NAVIGATOR CON ---

// 1. Stack Tìm việc (Dành cho Ứng viên)
const JobSearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ApplicantHome" component={ApplicantHome} options={{ headerShown: false }} />
    <Stack.Screen name="JobDetail" component={JobDetail} options={{ title: "Chi tiết công việc" }} />
    <Stack.Screen name="ApplyJob" component={ApplyJob} options={{ title: "Ứng tuyển" }} />
  </Stack.Navigator>
);

// 2. Stack Quản lý tin (Dành cho Recruiter)
const RecruiterDashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="RecruiterHome" component={RecruiterHome} options={{ headerShown: false }} />
    <Stack.Screen name="JobEditor" component={JobEditor} option={{ headerShown: false }} />
    <Stack.Screen name="AddJob" component={AddJob} option={{ headerShown: false }} />
  </Stack.Navigator>
);

// 3. Stack Hoạt động (Dùng chung tên Stack nhưng component bên trong sẽ linh hoạt)
const ActivityStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ApplicationList" component={MyApplications} options={{ headerShown: false }} />
    <Stack.Screen name="ApplicationDetail" component={ApplicationDetail} options={{ title: "Chi tiết công việc" }} />
  </Stack.Navigator>
);

// 4. Stack Cá nhân (Dùng chung)
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// --- TAB NAVIGATOR CHÍNH (GỘP CHUNG) ---
const MainTabNavigator = () => {
  const [user] = useContext(MyUserContext);
  const isRecruiter = user?.role === "RECRUITER";
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={isRecruiter ? RecruiterDashboardStack : JobSearchStack}
        options={{
          title: isRecruiter ? "Quản lý" : "Tìm việc",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name={isRecruiter ? "view-dashboard" : "briefcase-search"}
              size={26} color={color}
            />
          )
        }}
      />

      {/* TAB 2: HOẠT ĐỘNG (Ứng viên / Hồ sơ) */}
      <Tab.Screen
        name="ActivityTab"
        component={ActivityStack} // Dùng chung ActivityStack vì MyApplications đã xử lý logic hiển thị bên trong rồi
        options={{
          title: isRecruiter ? "Ứng viên" : "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name={isRecruiter ? "account-group" : "file-document-multiple"}
              size={26} color={color}
            />
          )
        }}
      />

      {/* TAB 3: CÁ NHÂN */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" size={26} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// --- APP COMPONENT ---
const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              // Chưa đăng nhập
              <>
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Home" component={MainTabNavigator} />
              </>
            ) : (
              // Đã đăng nhập -> Vào thẳng Tab chính
              <Stack.Screen name="Home" component={MainTabNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </MyUserContext.Provider>
  );
};

export default App;