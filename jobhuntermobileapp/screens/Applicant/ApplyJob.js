import React, { useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card, HelperText } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApplyJob = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [user] = useContext(MyUserContext);

    // States cho Form
    const [cvOption, setCvOption] = useState('current'); // 'current' hoặc 'new'
    const [newFile, setNewFile] = useState(null);
    const [fullName, setFullName] = useState(user.applicant.full_name || '');
    const [phone, setPhone] = useState(user.applicant.phone_number || '');
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        });
        if (!result.canceled) {
            setNewFile(result.assets[0]);
            setCvOption('new');
        }
    };

    const handleSendApplication = async () => {
        if (!fullName || !phone) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const formData = new FormData();

            // Thêm các trường thông tin vào FormData
            formData.append('full_name', fullName);
            formData.append('phone', phone);
            formData.append('cover_letter', coverLetter);

            if (cvOption === 'new' && newFile) {
                formData.append('file_cv', {
                    uri: newFile.uri,
                    name: newFile.name,
                    type: newFile.mimeType,
                });
            } else {
                formData.append('use_current_cv', 'true');
            }

            const res = await authApis(token).post(endpoints['apply-job'](jobId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.status === 201) {
                Alert.alert("Thành công", "Đơn ứng tuyển của bạn đã được gửi đi!");
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể gửi đơn. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Section 1: Your CV */}
            <Text style={styles.sectionTitle}>CV Của Bạn <Text style={{ color: 'red' }}>*</Text></Text>
            <View style={{ flex: 1 }}>
                <Button mode="outlined" onPress={pickDocument} style={styles.fileBtn} icon="upload" textColor="#2563eb">
                    Choose file
                </Button>
                <HelperText type="info" style={styles.helper}>Tải lên file .doc, .docx, hoặc .pdf (Tối đa 3MB)</HelperText>
            </View>

            <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
            <TextInput label="Full name *" value={fullName} onChangeText={setFullName} mode="outlined" outlineColor="#2563eb"
                activeOutlineColor="#2563eb"
                textColor="#1f2937" style={styles.input} />
            <TextInput label="Phone number *" value={phone} onChangeText={setPhone} mode="outlined" outlineColor="#2563eb"
                activeOutlineColor="#2563eb"
                textColor="#1f2937" keyboardType="phone-pad" style={styles.input} />
            {/* Section 3: Cover Letter */}
            <Text style={styles.sectionTitle}>Cover Letter <Text style={{ color: 'gray', fontSize: 14 }}>(Optional)</Text></Text>
            <Text style={styles.subHint}>Những kỹ năng, thành tích nào giúp bạn trở thành ứng viên sáng giá?</Text>
            <TextInput
                placeholder="Chi tiết và ví dụ cụ thể sẽ làm hồ sơ của bạn mạnh hơn..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                mode="outlined"
                multiline
                outlineColor="#e5e7eb"
                activeOutlineColor="#2563eb"
                textColor="#1f2937"
                numberOfLines={5}
                maxLength={500}
                style={styles.textArea}
            />
            <Text style={styles.charCount}>{500 - coverLetter.length} characters remaining</Text>

            <Button mode="contained" onPress={handleSendApplication} style={styles.submitBtn} loading={loading} disabled={loading}>
                Send my CV
            </Button>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    cvCard: { marginBottom: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', elevation: 0 },
    activeCard: { borderColor: '#2563eb', backgroundColor: '#fff5f5' },
    radioRow: { flexDirection: 'row', alignItems: 'flex-start' },
    radioLabel: { fontSize: 16, fontWeight: '500', marginTop: 8 },
    fileName: { color: '#1976D2', marginTop: 4 },
    fileBtn: { marginTop: 10, borderColor: '#2563eb' },
    fileHint: { marginTop: 8, fontSize: 13, color: '#666' },
    helper: { paddingHorizontal: 0, marginTop: 4, flexDirection: 'row', justifyContent: 'center' },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    subHint: { fontSize: 14, marginBottom: 8 },
    textArea: { backgroundColor: '#fff', height: 150, color: 'gray', fontSize: 16 },
    charCount: { textAlign: 'right', fontSize: 12, color: '#999', marginTop: 5 },
    submitBtn: { marginTop: 30, backgroundColor: '#2563eb', paddingVertical: 5, borderRadius: 4 },
});

export default ApplyJob;