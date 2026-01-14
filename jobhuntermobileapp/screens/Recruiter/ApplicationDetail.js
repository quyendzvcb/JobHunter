import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Text, Button, Avatar, RadioButton, TextInput, Divider, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';

const ApplicationDetail = ({ route, navigation }) => {
    const { application } = route.params;
    const applicant = application.applicant_detail || {};

    const [rating, setRating] = useState(application.recruiter_rating ? String(application.recruiter_rating) : '');
    const [status, setStatus] = useState(application.status || 'PENDING');
    const [submitting, setSubmitting] = useState(false);

    const handleUpdate = async () => {
        const normalizedRating = rating.replace(',', '.');
        const numRating = parseFloat(normalizedRating);

        if (rating && (isNaN(numRating) || numRating < 0 || numRating > 10)) {
            Alert.alert("Lỗi", "Vui lòng nhập điểm số hợp lệ (0 - 10)");
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const payload = {
                status: status,
                recruiter_rating: rating ? numRating : 0
            };

            await authApis(token).patch(endpoints['evaluate-application'](application.id), payload);

            Alert.alert("Thành công", "Đã cập nhật đánh giá!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.log(e);
            Alert.alert("Lỗi", "Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const openCV = () => {
        if (application?.cv_url) {
            Linking.openURL(application.cv_url).catch(() => Alert.alert("Lỗi", "Không thể mở file này"));
        } else {
            Alert.alert("Thông báo", "Ứng viên không đính kèm CV");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={styles.name}>Ứng viên: {applicant.full_name}</Text>
                        <Text style={{ color: '#666', fontSize: 20 }}>Ứng tuyển: <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>{application.job_detail?.title}</Text></Text>
                    </View>

                </View>

            </View>

            <Divider />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thư giới thiệu</Text>
                <Text style={styles.content}>{application.cover_letter || "Không có nội dung giới thiệu."}</Text>

                <Button
                    mode="outlined"
                    icon="file-download-outline"
                    onPress={openCV}
                    style={{ marginTop: 15, borderColor: '#1976D2' }}
                    textColor="#1976D2"
                >
                    Xem CV Ứng Viên
                </Button>
            </View>

            <Card style={styles.evaluationCard}>
                <Card.Content>
                    <Text style={[styles.sectionTitle, { color: '#1976D2', marginBottom: 15 }]}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={20} /> Đánh giá & Kết quả
                    </Text>

                    <TextInput
                        label="Điểm số (VD: 8.5)"
                        value={rating}
                        onChangeText={setRating}
                        keyboardType="decimal-pad"
                        mode="outlined"
                        placeholder="Nhập điểm..."
                        right={<TextInput.Affix text="/ 10" />}
                        outlineColor="#e5e7eb"
                        activeOutlineColor="#2563eb"
                        style={{ backgroundColor: 'white', marginBottom: 20 }}
                    />

                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Trạng thái hồ sơ:</Text>
                    <RadioButton.Group onValueChange={newValue => setStatus(newValue)} value={status}>
                        <View style={styles.radioRow}>
                            <RadioButton value="PENDING" color="orange" />
                            <Text>Chờ duyệt</Text>
                        </View>
                        <View style={styles.radioRow}>
                            <RadioButton value="ACCEPTED" color="green" />
                            <Text style={{ color: 'green', fontWeight: 'bold' }}>Chấp nhận</Text>
                        </View>
                        <View style={styles.radioRow}>
                            <RadioButton value="REJECTED" color="red" />
                            <Text style={{ color: 'red' }}>Từ chối</Text>
                        </View>
                    </RadioButton.Group>

                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        loading={submitting}
                        style={{ marginTop: 20, backgroundColor: '#1976D2' }}
                    >
                        Lưu Kết Quả
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { padding: 20, backgroundColor: 'white' },
    name: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    contactBar: { flexDirection: 'row', marginTop: 10, marginLeft: -10 },
    section: { padding: 20, backgroundColor: 'white', marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#444' },
    content: { lineHeight: 22, color: '#333', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
    evaluationCard: { margin: 15, backgroundColor: 'white', elevation: 3 },
    radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
});

export default ApplicationDetail;