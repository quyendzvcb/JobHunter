import React, { useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker'; // [THAY ĐỔI] Dùng ImagePicker
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadToCloudinary } from '../../utils/CloudinaryUpload';

const ApplyJob = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [user] = useContext(MyUserContext);

    // States
    const [newFile, setNewFile] = useState(null); // Lưu object ảnh được chọn
    const [fullName, setFullName] = useState(user.applicant?.full_name || '');
    const [phone, setPhone] = useState(user.applicant?.phone_number || '');
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);

    // [THAY ĐỔI] Hàm chọn ẢNH từ thư viện
    const pickImage = async () => {
        try {
            // Yêu cầu quyền truy cập thư viện
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ lấy ảnh
                quality: 1, // Chất lượng cao nhất
                allowsEditing: false, // Set true nếu muốn crop ảnh
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];

                // Xử lý tên file và mimeType (vì Android đôi khi trả về null)
                let localUri = asset.uri;
                let filename = asset.fileName || localUri.split('/').pop();

                // Tự đoán đuôi file nếu thiếu mimeType
                let match = /\.(\w+)$/.exec(filename);
                let type = asset.mimeType || (match ? `image/${match[1]}` : `image/jpeg`);

                // Lưu vào state theo đúng cấu trúc cũ để logic bên dưới không phải sửa
                setNewFile({
                    uri: localUri,
                    name: filename,
                    mimeType: type,
                    size: asset.fileSize || 0
                });
            }
        } catch (err) {
            console.log("Lỗi chọn ảnh:", err);
            Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
        }
    };

    const handleSendApplication = async () => {
        if (!fullName || !phone) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ Họ tên và Số điện thoại.");
            return;
        }

        if (!newFile) {
            Alert.alert("Thiếu Ảnh", "Vui lòng chọn ảnh CV của bạn.");
            return;
        }

        setLoading(true);

        try {
            const cvUrl = await uploadToCloudinary(newFile.uri, newFile.name, newFile.mimeType);

            console.log(cvUrl);
            if (!cvUrl) {
                Alert.alert("Lỗi Upload", "Không thể tải ảnh lên. Vui lòng thử lại.");
                setLoading(false);
                return;
            }

            console.log("Upload ảnh thành công, URL:", cvUrl);

            const token = await AsyncStorage.getItem('token');
            const formData = new FormData();

            formData.append('cover_letter', coverLetter);
            formData.append('job', jobId);
            formData.append('cv_url', cvUrl);

            const res = await authApis(token).post(endpoints['apply-job'], formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.status === 201) {
                Alert.alert("Thành công", "Đơn ứng tuyển của bạn đã được gửi đi!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }

        } catch (error) {
            console.error("Lỗi gửi đơn:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi đơn ứng tuyển.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* --- Section 1: Upload Ảnh CV --- */}
            <Text style={styles.sectionTitle}>Ảnh CV / Portfolio <Text style={{ color: 'red' }}>*</Text></Text>

            <View style={styles.uploadArea}>
                {newFile ? (
                    // [THAY ĐỔI] Giao diện khi đã chọn ảnh (Hiện Preview)
                    <View style={styles.fileSelectedBox}>
                        {/* Hiện ảnh thumbnail */}
                        <Image source={{ uri: newFile.uri }} style={{ width: 50, height: 50, borderRadius: 4, marginRight: 10 }} />

                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>{newFile.name}</Text>
                            <Text style={{ fontSize: 12, color: 'gray' }}>
                                {newFile.size > 0 ? (newFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Image File'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setNewFile(null)}>
                            <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Giao diện chưa chọn file
                    <Button
                        mode="outlined"
                        onPress={pickImage} // Gọi hàm pickImage
                        style={styles.fileBtn}
                        icon="image-outline" // Đổi icon
                        textColor="#2563eb"
                    >
                        Chọn ảnh từ thư viện
                    </Button>
                )}
                {/* Cập nhật HelperText */}
                <HelperText type="info" style={styles.helper}>
                    Hỗ trợ: .jpg, .png, .jpeg (Max 5MB)
                </HelperText>
            </View>

            {/* --- Section 2: Thông tin cá nhân (GIỮ NGUYÊN) --- */}
            <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
            <TextInput
                label="Họ và tên *"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                outlineColor="#2563eb"
                activeOutlineColor="#2563eb"
                style={styles.input}
            />
            <TextInput
                label="Số điện thoại *"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                outlineColor="#2563eb"
                activeOutlineColor="#2563eb"
                keyboardType="phone-pad"
                style={styles.input}
            />

            {/* --- Section 3: Cover Letter (GIỮ NGUYÊN) --- */}
            <Text style={styles.sectionTitle}>Thư giới thiệu <Text style={{ color: 'gray', fontSize: 14 }}>(Tùy chọn)</Text></Text>
            <Text style={styles.subHint}>Hãy cho nhà tuyển dụng biết tại sao bạn phù hợp.</Text>
            <TextInput
                placeholder="Viết ngắn gọn về kinh nghiệm và kỹ năng của bạn..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                mode="outlined"
                multiline
                numberOfLines={5}
                outlineColor="#e5e7eb"
                activeOutlineColor="#2563eb"
                style={styles.textArea}
                maxLength={500}
            />
            <Text style={styles.charCount}>{500 - coverLetter.length} ký tự còn lại</Text>

            {/* --- Submit Button (GIỮ NGUYÊN) --- */}
            <Button
                mode="contained"
                onPress={handleSendApplication}
                style={styles.submitBtn}
                contentStyle={{ height: 50 }}
                loading={loading}
                disabled={loading}
            >
                {loading ? "Đang xử lý..." : "Gửi Hồ Sơ Ứng Tuyển"}
            </Button>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#1f2937' },

    uploadArea: { marginBottom: 10 },
    fileBtn: { borderColor: '#2563eb', borderStyle: 'dashed', borderWidth: 1 },
    fileSelectedBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bae6fd'
    },

    helper: { paddingHorizontal: 0, marginTop: 4, fontStyle: 'italic' },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    subHint: { fontSize: 14, marginBottom: 8, color: '#6b7280' },
    textArea: { backgroundColor: '#fff', height: 120, textAlignVertical: 'top' },
    charCount: { textAlign: 'right', fontSize: 12, color: '#9ca3af', marginTop: 5 },

    submitBtn: { marginTop: 30, backgroundColor: '#2563eb', borderRadius: 8 },
});

export default ApplyJob;