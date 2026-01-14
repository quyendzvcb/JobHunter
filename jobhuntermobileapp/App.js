import React, { useContext, useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

import { MyUserContext } from "./utils/contexts/MyUserContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";

import Welcome from "./screens/Welcome/Welcome";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";

import ApplicantHome from "./screens/Applicant/ApplicantHome";
import JobDetail from "./screens/Applicant/JobDetail";
import ApplyJob from "./screens/Applicant/ApplyJob";
import CompareJobs from "./screens/Applicant/CompareJobs";

import RecruiterHome from "./screens/Recruiter/RecruiterHome";
import JobEditor from "./screens/Recruiter/JobEditor";
import AddJob from "./screens/Recruiter/AddJob";

import MyApplications from "./screens/User/MyApplications";
import ApplicationDetail from "./screens/Recruiter/ApplicationDetail";
import Profile from "./screens/User/Profile";
import PackageList from "./screens/Payment/PackageList";
import PaymentHistory from "./screens/Payment/PaymentHistory";
import CreatePayment from './screens/Payment/CreatePayment';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ApplicantStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ApplicantHome" component={ApplicantHome} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetail" component={JobDetail} options={{ title: "Chi tiết công việc" }} />
      <Stack.Screen name="ApplyJob" component={ApplyJob} options={{ title: "Ứng tuyển" }} />
      <Stack.Screen name="CompareJobs" component={CompareJobs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const RecruiterStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecruiterHome" component={RecruiterHome} options={{ headerShown: false }} />
      <Stack.Screen name="JobEditor" component={JobEditor} options={{ headerShown: false }} />
      <Stack.Screen name="AddJob" component={AddJob} options={{ headerShown: false }} />
      <Stack.Screen name="PackageList" component={PackageList} options={{ title: 'Chọn gói dịch vụ' }} />
      <Stack.Screen name="CreatePayment" component={CreatePayment} options={{ title: "Thanh toán" }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistory} options={{ title: 'Lịch sử giao dịch' }} />
    </Stack.Navigator>
  );
};

const ActivityStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ApplicationList" component={MyApplications} options={{ headerShown: false }} />
      <Stack.Screen name="ApplicationDetail" component={ApplicationDetail} options={{ title: "Chi tiết hồ sơ" }} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="PackageList" component={PackageList} options={{ title: 'Chọn gói dịch vụ' }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistory} options={{ title: 'Lịch sử giao dịch' }} />
      <Stack.Screen name="CreatePayment" component={CreatePayment} options={{ title: "Thanh toán" }} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  const [user] = useContext(MyUserContext);
  const isRecruiter = user?.role === "RECRUITER";

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1976D2' }}>
      <Tab.Screen
        name="HomeTab"
        component={isRecruiter ? RecruiterStack : ApplicantStack}
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

      <Tab.Screen
        name="ActivityTab"
        component={ActivityStack}
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

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              <>
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Home" component={MainTabNavigator} />
              </>
            ) : (
              <Stack.Screen name="Home" component={MainTabNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </MyUserContext.Provider>
  );
};

export default App;