import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import LoginStyle from "./LoginStyle";
import Apis, { endpoints, authApis } from "../../utils/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UnifiedTextInput from "../../components/Common/UnifiedTextInput";

const Login = () => {
    const nav = useNavigation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [, dispatch] = useContext(MyUserContext);

    const login = async () => {
        if (!username || !password) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
            return;
        }
        try {
            setLoading(true);
            const res = await Apis.post(endpoints['login'], {
                username, password,
                'grant_type': 'password',
                'client_id': process.env.EXPO_PUBLIC_CLIENT_ID,
                'client_secret': process.env.EXPO_PUBLIC_CLIENT_SECRET
            }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

            await AsyncStorage.setItem("token", res.data.access_token);
            const userRes = await authApis(res.data.access_token).get(endpoints['current-user']);
            dispatch({ "type": "login", "payload": userRes.data });
        } catch (ex) {
            Alert.alert("Lỗi", "Tên đăng nhập hoặc mật khẩu không chính xác!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={LoginStyle.container}>
            <ScrollView
                contentContainerStyle={[LoginStyle.scrollContent, { marginTop: 80 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={LoginStyle.content}>
                    <View style={LoginStyle.header}>
                        <Text style={LoginStyle.title}>ĐĂNG NHẬP</Text>
                        <Text style={LoginStyle.subtitle}>Chào mừng bạn quay trở lại!</Text>
                    </View>
                    <View style={LoginStyle.form}>
                        <UnifiedTextInput
                            label="Tên đăng nhập"
                            value={username}
                            onChangeText={setUsername}
                            icon="account"
                        />
                        <UnifiedTextInput
                            label="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock"
                            secure={!showPassword}
                            rightIcon={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />
                        <Button mode="contained" loading={loading} style={LoginStyle.loginButton} onPress={login}>
                            ĐĂNG NHẬP
                        </Button>
                        <View style={[LoginStyle.signupContainer, { marginTop: 10 }]}>
                            <Text style={LoginStyle.signupText}>Bạn chưa có tài khoản? </Text>
                            <TouchableOpacity onPress={() => nav.navigate("Register")}>
                                <Text style={LoginStyle.signupLink}>Đăng kí ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default Login;