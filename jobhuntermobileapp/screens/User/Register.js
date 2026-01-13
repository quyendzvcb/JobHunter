import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { TextInput, Button, RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RegisterStyle from "./RegisterStyle";
import Apis, { endpoints } from "../../utils/Apis";
import UnifiedTextInput from "../../components/Common/UnifiedTextInput";
import { uploadToCloudinary } from '../../components/Upload/CloudinaryUpload';

const Register = () => {
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("APPLICANT");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("MALE");
    const [companyName, setCompanyName] = useState("");
    const [companyLocation, setCompanyLocation] = useState("");
    const [webURL, setWebURL] = useState("");
    const [avatar, setAvatar] = useState(null);

    const [errors, setErrors] = useState({});

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
                setAvatar(result.assets[0]);
            }
        }
    }

    const validate = () => {
        if (!password || password !== confirm) {
            setErrors({ confirm: "Mật khẩu xác nhận không khớp!" });
            return false;
        }
        return true;
    }

    const register = async () => {
        if (validate()) {
            setLoading(true);
            try {
                let form = new FormData();
                form.append('first_name', firstName);
                form.append('last_name', lastName);
                form.append('username', username);
                form.append('password', password);
                form.append('email', email);

                if (avatar) {
                    const imageUrl = await uploadToCloudinary(avatar);
                    const imageKey = role === 'RECRUITER' ? 'logo' : 'avatar';
                    form.append(imageKey, imageUrl);
                }

                let url = "";
                if (role === "APPLICANT") {
                    url = endpoints['register-applicant'];
                    form.append('gender', gender);
                    form.append('address', address);
                    form.append('phone_number', phoneNumber);
                    if (dob) form.append('dob', dob);
                } else {
                    url = endpoints['register-recruiter'];
                    form.append('company_name', companyName);
                    form.append('company_location', companyLocation);
                    form.append('webURL', webURL);
                }

                let res = await Apis.post(url, form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.status === 201) {
                    Alert.alert("Thành công", "Đăng ký tài khoản thành công!");
                    nav.replace("Login");
                }
            } catch (ex) {
                console.error(ex);
                if (ex.response && ex.response.data) {
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

                    <TouchableOpacity onPress={pickImage} style={RegisterStyle.avatarContainer}>
                        <View style={[RegisterStyle.avatarWrapper, avatar && RegisterStyle.avatarWrapperSelected]}>
                            {avatar ? <Image source={{ uri: avatar.uri }} style={{ width: 100, height: 100 }} /> :
                                <MaterialCommunityIcons name={role === 'RECRUITER' ? "domain" : "camera-plus"} size={40} color="#2563eb" />}
                        </View>
                        <Text style={RegisterStyle.avatarLabel}>{role === 'RECRUITER' ? "Tải lên Logo" : "Tải lên Ảnh đại diện"}</Text>
                    </TouchableOpacity>

                    <View style={RegisterStyle.form}>
                        <UnifiedTextInput
                            label="Họ"
                            value={lastName}
                            onChangeText={setLastName}
                            icon="alphabetical"
                            errorText={errors.last_name}
                            wrapperStyle={RegisterStyle.inputWrapper}
                        />

                        <UnifiedTextInput
                            label="Tên"
                            value={firstName}
                            onChangeText={setFirstName}
                            icon="alphabetical"
                            errorText={errors.first_name}
                            wrapperStyle={RegisterStyle.inputWrapper}
                        />

                        <UnifiedTextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            icon="email"
                            keyboardType="email-address"
                            errorText={errors.email}
                            wrapperStyle={RegisterStyle.inputWrapper}
                        />

                        <UnifiedTextInput
                            label="Tên đăng nhập"
                            value={username}
                            onChangeText={setUsername}
                            icon="account"
                            errorText={errors.username}
                            wrapperStyle={RegisterStyle.inputWrapper}
                        />

                        <UnifiedTextInput
                            label="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock"
                            secure={!showPass}
                            errorText={errors.password}
                            rightIcon={
                                <TextInput.Icon
                                    icon={showPass ? "eye-off" : "eye"}
                                    color="#2563eb"
                                    onPress={() => setShowPass(!showPass)}
                                />
                            }
                            wrapperStyle={RegisterStyle.inputWrapper}
                        />

                        <UnifiedTextInput
                            label="Xác nhận mật khẩu"
                            value={confirm}
                            onChangeText={setConfirm}
                            icon="lock-check"
                            secure={!showConfirm}
                            errorText={errors.confirm}
                            rightIcon={
                                <TextInput.Icon
                                    icon={showConfirm ? "eye-off" : "eye"}
                                    color="#2563eb"
                                    onPress={() => setShowConfirm(!showConfirm)}
                                />
                            }
                            wrapperStyle={RegisterStyle.inputWrapper}
                        />

                        <Text style={RegisterStyle.sectionTitle}>
                            {role === 'APPLICANT' ? "Thông tin cá nhân" : "Thông tin doanh nghiệp"}
                        </Text>

                        {role === 'APPLICANT' ? (
                            <>
                                <UnifiedTextInput
                                    label="Số điện thoại"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    icon="phone"
                                    keyboardType="phone-pad"
                                    errorText={errors.phone_number}
                                    wrapperStyle={RegisterStyle.inputWrapper}
                                />

                                <UnifiedTextInput
                                    label="Địa chỉ"
                                    value={address}
                                    onChangeText={setAddress}
                                    icon="map-marker"
                                    errorText={errors.address}
                                    wrapperStyle={RegisterStyle.inputWrapper}
                                />

                                <UnifiedTextInput
                                    label="Ngày sinh (YYYY-MM-DD)"
                                    value={dob}
                                    onChangeText={setDob}
                                    icon="calendar"
                                    errorText={errors.dob}
                                    wrapperStyle={RegisterStyle.inputWrapper}
                                />

                                <View style={[RegisterStyle.inputWrapper, { marginBottom: 10 }]}>
                                    <Text style={{ color: '#4b5563', marginBottom: 8, fontWeight: '600' }}>Giới tính:</Text>
                                    <RadioButton.Group onValueChange={setGender} value={gender}>
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
                                <UnifiedTextInput
                                    label="Tên công ty"
                                    value={companyName}
                                    onChangeText={setCompanyName}
                                    icon="domain"
                                    errorText={errors.company_name}
                                    wrapperStyle={RegisterStyle.inputWrapper}
                                />

                                <UnifiedTextInput
                                    label="Địa chỉ công ty"
                                    value={companyLocation}
                                    onChangeText={setCompanyLocation}
                                    icon="map-marker"
                                    errorText={errors.company_location}
                                    wrapperStyle={RegisterStyle.inputWrapper}
                                />

                                <UnifiedTextInput
                                    label="Website"
                                    value={webURL}
                                    onChangeText={setWebURL}
                                    icon="link"
                                    keyboardType="url"
                                    errorText={errors.webURL}
                                    wrapperStyle={RegisterStyle.inputWrapper}
                                />
                            </>
                        )}

                        <Button
                            mode="contained"
                            onPress={register}
                            loading={loading}
                            disabled={loading}
                            style={RegisterStyle.registerButton}
                            contentStyle={{ height: 55 }}
                            labelStyle={RegisterStyle.registerButtonLabel}
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