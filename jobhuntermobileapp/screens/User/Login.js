import React, { useContext, useState } from "react";
import { View, Alert } from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import MyStyles from "../../styles/MyStyles";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigation();

    const handleLogin = async () => {
        setLoading(true);
        try {
            // Thay client_id/secret của bạn vào đây
            const res = await Apis.post(endpoints['login'], {
                "client_id": "qCIXUuHLngrsgjhSayw5Ah0fuBUbtaIfDFGozTJW",
                "client_secret": "CeoKoM5FzZCRUXvRgv2DkgNG7r8faBxsoZM7XwErMvvYhfgVLoReRzmjVRfEyHDyeIHBMPDX2ldWTW0LYHXNYY8i7gSKfdynOgb4oMm7ZtrEILrVkKGeZ6CILsxKVM5O",
                "grant_type": "password"
            });

            const token = res.data.access_token;
            const userRes = await authApis(token).get(endpoints['current-user']);

            dispatch({ type: "login", payload: { ...userRes.data, token: token } });
            nav.goBack(); // Quay lại Profile
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Tên đăng nhập hoặc mật khẩu không đúng!");
        } finally { setLoading(false); }
    }

    return (
        <View style={[MyStyles.container, MyStyles.content, MyStyles.center, { backgroundColor: 'white' }]}>
            <Text style={MyStyles.headerTitle}>ĐĂNG NHẬP</Text>
            <View style={{ width: '100%' }}>
                <TextInput label="Tên đăng nhập" value={username} onChangeText={setUsername} mode="outlined" style={MyStyles.input} />
                <TextInput label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={MyStyles.input} />
                <Button mode="contained" loading={loading} onPress={handleLogin} style={MyStyles.btnPrimary} contentStyle={{ height: 50 }}>ĐĂNG NHẬP</Button>
            </View>
        </View>
    );
}
export default Login;