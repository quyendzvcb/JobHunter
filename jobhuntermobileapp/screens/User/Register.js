import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { TextInput, Button, HelperText, RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RegisterStyle from "./RegisterStyle";
import Apis, { endpoints } from "../../utils/Apis";

// --- COMPONENT INPUT ---
const RenderInput = ({ label, value, onChange, icon, secure = false, rightIcon = null, keyboardType = 'default', style = {}, errorText = null }) => (
    <View style={[RegisterStyle.inputWrapper, style]}>
        <TextInput
            mode="outlined"
            label={label}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secure}
            keyboardType={keyboardType}
            style={RegisterStyle.input}
            outlineColor={errorText ? "#B00020" : "#e5e7eb"}
            activeOutlineColor={errorText ? "#B00020" : "#2563eb"}
            textColor="#1f2937"
            right={rightIcon}
        />
        {errorText && (
            <HelperText type="error" visible={true} style={{ paddingLeft: 0, fontSize: 12 }}>
                {errorText}
            </HelperText>
        )}
    </View>
);

const Register = () => {
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("APPLICANT");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // --- KHÔI PHỤC STATE LƯU LỖI CHI TIẾT ---
    const [errors, setErrors] = useState({});

    const [user, setUser] = useState({
        first_name: "", last_name: "", email: "", username: "", password: "", confirm: "",
        phone_number: "", address: "", gender: "MALE", dob: "",
        company_name: "", company_location: "", webURL: ""
    });

    const updateState = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[field]) {
            setErrors(e => ({ ...e, [field]: null }));
        }
    };

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Lỗi", "Cần cấp quyền truy cập ảnh!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });
            if (!result.canceled) {
                // Lưu vào user.avatar thay vì state riêng
                updateState("avatar", result.assets[0]);
            }
        }
    }

    const validate = () => {
        let isValid = true;
        let newErrors = {};

        if (!user.password || user.password !== user.confirm) {
            newErrors.confirm = "Mật khẩu xác nhận không khớp!";
            isValid = false;
        }

        // Cập nhật lỗi để hiển thị đỏ
        setErrors(newErrors);
        return isValid;
    }

    const register = async () => {
        if (validate()) {
            setLoading(true);
            try {
                let form = new FormData();

                // 1. Append các trường cơ bản
                const commonFields = ['first_name', 'last_name', 'username', 'password', 'email'];
                commonFields.forEach(field => {
                    if (user[field]) form.append(field, user[field]);
                });

                // 2. Xử lý ảnh (Dùng user.avatar)
                if (user.avatar) {
                    const imageKey = role === 'RECRUITER' ? 'logo' : 'avatar';
                    form.append(imageKey, {
                        uri: user.avatar.uri,
                        name: user.avatar.fileName || 'image.jpg',
                        type: 'image/jpeg'
                    });
                }
                // 3. Chọn URL và append trường riêng biệt
                let url = "";
                if (role === "APPLICANT") {
                    url = endpoints['register-applicant'];
                    form.append('gender', user.gender);
                    form.append('address', user.address);
                    form.append('phone_number', user.phone_number);
                    if (user.dob) form.append('dob', user.dob);
                } else {
                    url = endpoints['register-recruiter'];
                    form.append('company_name', user.company_name);
                    form.append('company_location', user.company_location);
                    form.append('webURL', user.webURL);
                }

                console.info("Registering to URL:", url);

                // 4. Gọi API
                let res = await Apis.post(url, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 201) {
                    Alert.alert("Thành công", "Đăng ký tài khoản thành công!");
                    nav.replace("Login");
                }
            } catch (ex) {
                console.error(ex);
                if (ex.response && ex.response.data) {
                    // Hiển thị lỗi từ server lên các ô input tương ứng
                    const serverErrors = ex.response.data;
                    let formattedErrors = {};
                    for (let key in serverErrors) {
                        let errorMessage = serverErrors[key];
                        if (Array.isArray(errorMessage)) errorMessage = errorMessage[0];
                        formattedErrors[key] = errorMessage;
                    }
                    setErrors(formattedErrors);
                }
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={RegisterStyle.container}>
            <ScrollView contentContainerStyle={RegisterStyle.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={RegisterStyle.content}>

                    <View style={RegisterStyle.header}>
                        <Text style={RegisterStyle.title}>ĐĂNG KÝ</Text>
                        <Text style={RegisterStyle.subtitle}>Tạo tài khoản mới</Text>
                    </View>

                    <View style={RegisterStyle.roleContainer}>
                        <TouchableOpacity
                            style={[RegisterStyle.roleButton, role === 'APPLICANT' && RegisterStyle.roleButtonActive]}
                            onPress={() => setRole('APPLICANT')}>
                            <Text style={[RegisterStyle.roleText, role === 'APPLICANT' && RegisterStyle.roleTextActive]}>Ứng viên</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[RegisterStyle.roleButton, role === 'RECRUITER' && RegisterStyle.roleButtonActive]}
                            onPress={() => setRole('RECRUITER')}>
                            <Text style={[RegisterStyle.roleText, role === 'RECRUITER' && RegisterStyle.roleTextActive]}>Nhà tuyển dụng</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- SỬA LỖI AVATAR TẠI ĐÂY (dùng user.avatar) --- */}
                    <TouchableOpacity onPress={pickImage} style={RegisterStyle.avatarContainer}>
                        <View style={[RegisterStyle.avatarWrapper, user.avatar && RegisterStyle.avatarWrapperSelected]}>
                            {user.avatar ? <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100 }} /> :
                                <MaterialCommunityIcons name={role === 'RECRUITER' ? "domain" : "camera-plus"} size={40} color="#2563eb" />}
                        </View>
                        <Text style={RegisterStyle.avatarLabel}>{role === 'RECRUITER' ? "Tải lên Logo" : "Tải lên Ảnh đại diện"}</Text>
                    </TouchableOpacity>

                    <View style={RegisterStyle.form}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <RenderInput label="Họ" value={user.last_name} onChange={t => updateState('last_name', t)}
                                style={RegisterStyle.halfInput} errorText={errors.last_name} />
                            <RenderInput label="Tên" value={user.first_name} onChange={t => updateState('first_name', t)}
                                style={RegisterStyle.halfInput} errorText={errors.first_name} />
                        </View>

                        <RenderInput label="Email" value={user.email} onChange={t => updateState('email', t)}
                            errorText={errors.email} />

                        <RenderInput label="Tên đăng nhập" value={user.username} onChange={t => updateState('username', t)}
                            errorText={errors.username} />

                        <RenderInput label="Mật khẩu" value={user.password} onChange={t => updateState('password', t)}
                            secure={!showPass} errorText={errors.password}
                            rightIcon={<TextInput.Icon icon={showPass ? "eye-off" : "eye"} color="#2563eb" onPress={() => setShowPass(!showPass)} />} />

                        <RenderInput label="Xác nhận mật khẩu" value={user.confirm} onChange={t => updateState('confirm', t)}
                            secure={!showConfirm} errorText={errors.confirm}
                            rightIcon={<TextInput.Icon icon={showConfirm ? "eye-off" : "eye"} color="#2563eb" onPress={() => setShowConfirm(!showConfirm)} />} />

                        <Text style={RegisterStyle.sectionTitle}>
                            {role === 'APPLICANT' ? "Thông tin cá nhân" : "Thông tin doanh nghiệp"}
                        </Text>

                        {role === 'APPLICANT' ? (
                            <>
                                <RenderInput label="Số điện thoại" value={user.phone_number} onChange={t => updateState('phone_number', t)}
                                    keyboardType="phone-pad" errorText={errors.phone_number} />

                                <RenderInput label="Địa chỉ" value={user.address} onChange={t => updateState('address', t)}
                                    errorText={errors.address} />

                                <RenderInput label="Ngày sinh(YYYY-MM-DD)" value={user.dob} onChange={t => updateState('dob', t)}
                                    errorText={errors.dob} />

                                <View style={[RegisterStyle.inputWrapper, { marginBottom: 10 }]}>
                                    <Text style={{ color: '#4b5563', marginBottom: 8, fontWeight: '600' }}>Giới tính:</Text>
                                    <RadioButton.Group onValueChange={v => updateState('gender', v)} value={user.gender}>
                                        <View style={RegisterStyle.row}>
                                            <View style={[RegisterStyle.row, { marginRight: 20 }]}>
                                                <RadioButton value="MALE" color="#2563eb" />
                                                <Text style={RegisterStyle.radioLabel}>Nam</Text>
                                            </View>
                                            <View style={[RegisterStyle.row, { marginRight: 20 }]}>
                                                <RadioButton value="FEMALE" color="#2563eb" />
                                                <Text style={RegisterStyle.radioLabel}>Nữ</Text>
                                            </View>
                                            <View style={RegisterStyle.row}>
                                                <RadioButton value="OTHER" color="#2563eb" />
                                                <Text style={RegisterStyle.radioLabel}>Khác</Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                </View>
                            </>
                        ) : (
                            <>
                                <RenderInput label="Tên công ty" value={user.company_name} onChange={t => updateState('company_name', t)}
                                    errorText={errors.company_name} />

                                <RenderInput label="Địa chỉ công ty" value={user.company_location} onChange={t => updateState('company_location', t)}
                                    errorText={errors.company_location} />

                                <RenderInput label="Website" value={user.webURL} onChange={t => updateState('webURL', t)}
                                    errorText={errors.webURL} />
                            </>
                        )}

                        <Button
                            mode="contained"
                            onPress={register}
                            loading={loading}
                            disabled={loading}
                            style={RegisterStyle.registerButton}
                            contentStyle={{ height: 55 }}
                            labelStyle={RegisterStyle.registerButtonText}
                        >
                            ĐĂNG KÝ NGAY
                        </Button>

                        <View style={RegisterStyle.loginContainer}>
                            <Text style={RegisterStyle.loginText}>Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => nav.replace("Login")}>
                                <Text style={RegisterStyle.loginLink}>Đăng nhập ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;