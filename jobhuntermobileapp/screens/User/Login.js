import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginStyle from "./LoginStyle";
import Apis, { endpoints, authApis } from "../../utils/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RenderInput = ({ label, value, onChange, icon, secure = false, rightIcon = null, style = {} }) => (
    <View style={[LoginStyle.inputWrapper, style]}>
        <TextInput
            mode="outlined"
            label={label}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secure}
            style={LoginStyle.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#2563eb"
            textColor="#1f2937"
            left={
                <TextInput.Icon
                    icon={() => (
                        <View pointerEvents="none" style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name={icon} size={24} color="#2563eb" />
                        </View>
                    )}
                />
            }
            right={rightIcon}
        />
    </View>
);

const Login = () => {
    const nav = useNavigation();
    const [user, setUser] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [, dispatch] = useContext(MyUserContext);

    const updateState = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
    };

    const validate = () => {

    }

    const login = async () => {
        if (!user.username || !user.password) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
            return;
        }


        try {
            setLoading(true);
            // 1. Gọi API lấy Token OAuth2
            const res = await Apis.post(endpoints['login'], {
                ...user,
                'grant_type': 'password',
                'client_id': process.env.EXPO_PUBLIC_CLIENT_ID,
                'client_secret': process.env.EXPO_PUBLIC_CLIENT_SECRET
            }, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            // 2. Lưu token
            await AsyncStorage.setItem("token", res.data.access_token);

            setTimeout(async () => {
                const userRes = await authApis(res.data.access_token).get(endpoints['current-user']);
                dispatch({
                    "type": "login",
                    "payload": userRes.data
                });
                const next = route.params?.next;
                if (next)
                    nav.navigate(next);
            }, 500);

        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Tên đăng nhập hoặc mật khẩu không chính xác!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={LoginStyle.container}
        >
            <ScrollView contentContainerStyle={[LoginStyle.scrollContent, { marginTop: 80 }]} showsVerticalScrollIndicator={false}>
                <View style={LoginStyle.content}>

                    {/* Header */}
                    <View style={LoginStyle.header}>
                        <Text style={LoginStyle.title}>ĐĂNG NHẬP</Text>
                        <Text style={LoginStyle.subtitle}>Chào mừng bạn quay trở lại!</Text>
                    </View>

                    {/* Form Input */}
                    <View style={LoginStyle.form}>

                        <RenderInput
                            label="Tên đăng nhập"
                            value={user.username}
                            onChange={t => updateState('username', t)}
                            icon="account"
                        />

                        <RenderInput
                            label="Mật khẩu"
                            value={user.password}
                            onChange={t => updateState('password', t)}
                            icon="lock"
                            secure={!showPassword}
                            rightIcon={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    color="#2563eb"
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />


                        <Button
                            mode="contained"
                            loading={loading}
                            disabled={loading}
                            style={LoginStyle.loginButton}
                            labelStyle={LoginStyle.loginButtonLabel}
                            contentStyle={{ height: 55 }}
                            onPress={login}
                        >
                            ĐĂNG NHẬP
                        </Button>

                        {/* Footer */}
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