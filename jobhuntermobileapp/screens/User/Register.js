import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { TextInput, Button, HelperText, RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RegisterStyle from "./RegisterStyle";
import Apis, { endpoints } from "../../utils/Apis";

// --- 1. COMPONENT INPUT (Đã cập nhật để hiện lỗi đỏ) ---
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
            left={
                <TextInput.Icon
                    icon={() => (
                        <View pointerEvents="none" style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name={icon} size={24} color={errorText ? "#B00020" : "#2563eb"} />
                        </View>
                    )}
                    disabled={true}
                    style={{ margin: 0, padding: 0 }}
                />
            }
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
    const [avatar, setAvatar] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // State lưu lỗi từ Server
    const [errors, setErrors] = useState({});

    const [user, setUser] = useState({
        first_name: "", last_name: "", email: "", username: "", password: "", confirm: "",
        phone_number: "", address: "", gender: "MALE", dob: "",
        company_name: "", company_location: "", webURL: ""
    });

    const updateState = (field, value) => {
        setUser(c => ({ ...c, [field]: value }));
        if (errors[field]) {
            setErrors(e => ({ ...e, [field]: null }));
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            updateState('dob', `${year}-${month}-${day}`);
        }
    };

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert("Lỗi", "Cần cấp quyền truy cập ảnh!");

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) setAvatar(result.assets[0]);
    };

    const register = async () => {
        setErrors({}); // Reset lỗi

        if (user.password !== user.confirm) {
            setErrors({ confirm: "Mật khẩu xác nhận không khớp!" });
            return;
        }

        setLoading(true);

        try {
            let form = new FormData();

            // Append dữ liệu chung
            ['first_name', 'last_name', 'email', 'username', 'password'].forEach(k => {
                form.append(k, user[k]);
            });

            // Append Avatar (Chú ý: name và type rất quan trọng)
            if (avatar) {
                form.append(role === 'RECRUITER' ? 'logo' : 'avatar', {
                    uri: avatar.uri,
                    name: avatar.fileName || 'image.jpg',
                    type: 'image/jpeg'
                });
            }

            // Append dữ liệu theo Role
            let url = "";
            if (role === 'APPLICANT') {
                url = endpoints['register-aplicant'];
                form.append('phone_number', user.phone_number);
                form.append('address', user.address);
                form.append('gender', user.gender);
                if (user.dob) form.append('dob', user.dob);
            } else {
                url = endpoints['register-recruiter'];
                ['company_name', 'company_location', 'webURL'].forEach(k => form.append(k, user[k]));
            }

            console.log("Đang gửi đăng ký đến:", url);

            // --- GỌI API (ĐÃ FIX LỖI CONTENT-TYPE) ---
            // Không set 'Content-Type': 'multipart/form-data' thủ công
            const res = await Apis.post(url, form, {
                headers: {
                    // Để trống Content-Type để Axios tự động thêm boundary
                    "Accept": "application/json",
                },
                transformRequest: (data, headers) => {
                    return data; // Ngăn Axios serialize FormData
                },
            });

            if (res.status === 201) {
                Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
                nav.replace("Login");
            }

        } catch (ex) {
            // --- LOG LỖI CHI TIẾT ---
            console.log("========== LỖI ĐĂNG KÝ ==========");
            if (ex.response) {
                // Server trả về response lỗi (4xx, 5xx)
                console.log("Status:", ex.response.status);
                console.log("Data:", JSON.stringify(ex.response.data, null, 2));

                // Xử lý hiển thị lỗi lên màn hình
                const serverErrors = ex.response.data;
                let formattedErrors = {};
                for (let key in serverErrors) {
                    let errorMessage = serverErrors[key];
                    if (Array.isArray(errorMessage)) errorMessage = errorMessage[0];
                    formattedErrors[key] = errorMessage;
                }

                setErrors(formattedErrors);

                if (formattedErrors.non_field_errors) {
                    Alert.alert("Lỗi", formattedErrors.non_field_errors);
                } else if (Object.keys(formattedErrors).length > 0) {
                    Alert.alert("Lỗi nhập liệu", "Vui lòng kiểm tra các ô báo đỏ.");
                } else {
                    Alert.alert("Lỗi Server", "Có lỗi xảy ra phía server.");
                }

            } else if (ex.request) {
                // Không nhận được phản hồi (Lỗi mạng)
                console.log("Network Error:", ex.message);
                Alert.alert("Lỗi kết nối", "Kiểm tra internet hoặc server có đang chạy không?");
            } else {
                // Lỗi code
                console.log("Error Message:", ex.message);
            }
            console.log("=================================");

        } finally {
            setLoading(false);
        }
    };

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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <RenderInput label="Họ" value={user.last_name} onChange={t => updateState('last_name', t)}
                                style={RegisterStyle.halfInput} errorText={errors.last_name} />
                            <RenderInput label="Tên" value={user.first_name} onChange={t => updateState('first_name', t)}
                                style={RegisterStyle.halfInput} errorText={errors.first_name} />
                        </View>

                        <RenderInput label="Email" value={user.email} onChange={t => updateState('email', t)}
                            icon="email" errorText={errors.email} />

                        <RenderInput label="Tên đăng nhập" value={user.username} onChange={t => updateState('username', t)}
                            icon="account" errorText={errors.username} />

                        <RenderInput label="Mật khẩu" value={user.password} onChange={t => updateState('password', t)}
                            icon="lock" secure={!showPass} errorText={errors.password}
                            rightIcon={<TextInput.Icon icon={showPass ? "eye-off" : "eye"} color="#2563eb" onPress={() => setShowPass(!showPass)} />} />

                        <RenderInput label="Xác nhận mật khẩu" value={user.confirm} onChange={t => updateState('confirm', t)}
                            icon="lock-check" secure={!showConfirm} errorText={errors.confirm}
                            rightIcon={<TextInput.Icon icon={showConfirm ? "eye-off" : "eye"} color="#2563eb" onPress={() => setShowConfirm(!showConfirm)} />} />

                        <Text style={RegisterStyle.sectionTitle}>
                            {role === 'APPLICANT' ? "Thông tin cá nhân" : "Thông tin doanh nghiệp"}
                        </Text>

                        {role === 'APPLICANT' ? (
                            <>
                                <RenderInput label="Số điện thoại" value={user.phone_number} onChange={t => updateState('phone_number', t)}
                                    icon="phone" keyboardType="phone-pad" errorText={errors.phone_number} />

                                <RenderInput label="Địa chỉ" value={user.address} onChange={t => updateState('address', t)}
                                    icon="map-marker" errorText={errors.address} />

                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={RegisterStyle.inputWrapper}>
                                    <View pointerEvents="none">
                                        <TextInput
                                            mode="outlined"
                                            label="Ngày sinh (YYYY-MM-DD)"
                                            value={user.dob}
                                            editable={false}
                                            style={RegisterStyle.input}
                                            outlineColor={errors.dob ? "#B00020" : "#e5e7eb"}
                                            activeOutlineColor={errors.dob ? "#B00020" : "#2563eb"}
                                            textColor="#1f2937"
                                            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="calendar" size={24} color={errors.dob ? "#B00020" : "#2563eb"} />} disabled={true} />}
                                        />
                                    </View>
                                    {errors.dob && <HelperText type="error" visible={true} style={{ paddingLeft: 0, fontSize: 12 }}>{errors.dob}</HelperText>}
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={user.dob ? new Date(user.dob) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                    />
                                )}

                                <View style={[RegisterStyle.inputWrapper, { marginBottom: 10 }]}>
                                    <Text style={{ color: '#4b5563', marginBottom: 8, fontWeight: '600' }}>Giới tính:</Text>
                                    <RadioButton.Group onValueChange={v => updateState('gender', v)} value={user.gender}>
                                        <View style={RegisterStyle.row}>
                                            <View style={[RegisterStyle.row, { marginRight: 20 }]}>
                                                <RadioButton value="MALE" color="#2563eb" />
                                                <Text style={RegisterStyle.radioLabel}>Nam</Text>
                                            </View>
                                            <View style={RegisterStyle.row}>
                                                <RadioButton value="FEMALE" color="#2563eb" />
                                                <Text style={RegisterStyle.radioLabel}>Nữ</Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                </View>
                            </>
                        ) : (
                            <>
                                <RenderInput label="Tên công ty" value={user.company_name} onChange={t => updateState('company_name', t)}
                                    icon="domain" errorText={errors.company_name} />

                                <RenderInput label="Địa chỉ công ty" value={user.company_location} onChange={t => updateState('company_location', t)}
                                    icon="map-marker-radius" errorText={errors.company_location} />

                                <RenderInput label="Website" value={user.webURL} onChange={t => updateState('webURL', t)}
                                    icon="web" errorText={errors.webURL} />
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