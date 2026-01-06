import React, { useState } from "react";
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Button, TextInput, Text, RadioButton, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
// SỬA: Đổi từ Apis thành Api cho đúng với tên file thực tế
import Apis, { endpoints } from "../../utils/Apis";
import MyStyles from "../../styles/MyStyles";

const Register = () => {
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("APPLICANT");
    const [avatar, setAvatar] = useState(null);

    const [baseInfo, setBaseInfo] = useState({ first_name: "", last_name: "", email: "", username: "", password: "", confirm: "" });
    const [recruiterInfo, setRecruiterInfo] = useState({ company_name: "", company_location: "", webURL: "" });
    const [applicantInfo, setApplicantInfo] = useState({ phone_number: "", address: "", gender: "MALE", dob: "" });

    const updateBase = (k, v) => setBaseInfo(c => ({ ...c, [k]: v }));
    const updateRec = (k, v) => setRecruiterInfo(c => ({ ...c, [k]: v }));
    const updateApp = (k, v) => setApplicantInfo(c => ({ ...c, [k]: v }));

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Lỗi", "Bạn cần cấp quyền truy cập thư viện ảnh.");
            return;
        }

        let res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        });

        if (!res.canceled) {
            setAvatar(res.assets[0]);
        }
    };

    const register = async () => {
        // Kiểm tra dữ liệu cơ bản
        if (!baseInfo.username || !baseInfo.password) {
            return Alert.alert("Lỗi", "Vui lòng nhập Username và Password");
        }
        if (baseInfo.password !== baseInfo.confirm) {
            return Alert.alert("Lỗi", "Mật khẩu không khớp");
        }

        setLoading(true);
        try {
            let form = new FormData();

            // Append thông tin cơ bản
            Object.keys(baseInfo).forEach(k => {
                if (k !== 'confirm') form.append(k, baseInfo[k]);
            });

            // Xử lý Avatar/Logo
            if (avatar) {
                const filename = avatar.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                form.append(role === 'RECRUITER' ? 'logo' : 'avatar', {
                    uri: avatar.uri,
                    name: filename,
                    type
                });
            }

            // Append thông tin riêng theo Role
            let extra = role === 'APPLICANT' ? applicantInfo : recruiterInfo;
            Object.keys(extra).forEach(k => form.append(k, extra[k]));

            // Xác định endpoint
            let url = role === 'APPLICANT' ? endpoints['register-applicant'] : endpoints['register-recruiter'];

            // SỬA: Sử dụng Api (đã fix tên import)
            let res = await Api.post(url, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 201 || res.status === 200) {
                Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
                nav.replace("Login");
            }
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={[MyStyles.container, MyStyles.content]}>
                <Text style={MyStyles.headerTitle}>ĐĂNG KÝ TÀI KHOẢN</Text>

                <View style={[MyStyles.row, { justifyContent: 'center', marginBottom: 15, alignItems: 'center' }]}>
                    <Text>Bạn là: </Text>
                    <RadioButton.Group onValueChange={setRole} value={role}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="APPLICANT" /><Text>Ứng viên</Text>
                            <RadioButton value="RECRUITER" /><Text style={{ marginLeft: 10 }}>Nhà tuyển dụng</Text>
                        </View>
                    </RadioButton.Group>
                </View>

                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    {avatar ? <Avatar.Image size={80} source={{ uri: avatar.uri }} /> : <Avatar.Icon size={80} icon="camera" />}
                    <Button onPress={pickImage}>{role === 'RECRUITER' ? "Chọn Logo Công Ty" : "Chọn Ảnh Đại Diện"}</Button>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <TextInput label="Họ" mode="outlined" style={[MyStyles.input, { flex: 1, marginRight: 5 }]} onChangeText={t => updateBase('last_name', t)} />
                    <TextInput label="Tên" mode="outlined" style={[MyStyles.input, { flex: 1 }]} onChangeText={t => updateBase('first_name', t)} />
                </View>

                <TextInput label="Email" mode="outlined" style={MyStyles.input} keyboardType="email-address" onChangeText={t => updateBase('email', t)} />
                <TextInput label="Username" mode="outlined" style={MyStyles.input} onChangeText={t => updateBase('username', t)} />
                <TextInput label="Password" mode="outlined" secureTextEntry style={MyStyles.input} onChangeText={t => updateBase('password', t)} />
                <TextInput label="Confirm Password" mode="outlined" secureTextEntry style={MyStyles.input} onChangeText={t => updateBase('confirm', t)} />

                {role === 'APPLICANT' ? (
                    <>
                        <TextInput label="SĐT" mode="outlined" keyboardType="phone-pad" style={MyStyles.input} onChangeText={t => updateApp('phone_number', t)} />
                        <TextInput label="Địa chỉ" mode="outlined" style={MyStyles.input} onChangeText={t => updateApp('address', t)} />
                        <TextInput label="Ngày sinh (YYYY-MM-DD)" mode="outlined" style={MyStyles.input} onChangeText={t => updateApp('dob', t)} />
                        <View style={[MyStyles.row, { alignItems: 'center', marginVertical: 10 }]}>
                            <Text>Giới tính: </Text>
                            <RadioButton.Group onValueChange={v => updateApp('gender', v)} value={applicantInfo.gender}>
                                <View style={MyStyles.row}>
                                    <RadioButton value="MALE" /><Text>Nam</Text>
                                    <RadioButton value="FEMALE" /><Text style={{ marginLeft: 10 }}>Nữ</Text>
                                </View>
                            </RadioButton.Group>
                        </View>
                    </>
                ) : (
                    <>
                        <TextInput label="Tên công ty" mode="outlined" style={MyStyles.input} onChangeText={t => updateRec('company_name', t)} />
                        <TextInput label="Địa chỉ công ty" mode="outlined" style={MyStyles.input} onChangeText={t => updateRec('company_location', t)} />
                        <TextInput label="Website (URL)" mode="outlined" style={MyStyles.input} onChangeText={t => updateRec('webURL', t)} />
                    </>
                )}

                <Button
                    mode="contained"
                    onPress={register}
                    loading={loading}
                    disabled={loading}
                    style={[MyStyles.btnPrimary, { marginVertical: 20 }]}
                    contentStyle={{ height: 50 }}
                >
                    ĐĂNG KÝ NGAY
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
export default Register;