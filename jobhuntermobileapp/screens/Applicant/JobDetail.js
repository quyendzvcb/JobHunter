import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/vi';
import { MyUserContext } from '../../utils/contexts/MyUserContext';
import Apis, { endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';


const JobDetail = ({ route, navigation }) => {
    const { job_id } = route.params;
    const [job, setJob] = useState([])
    const [user] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);

    const getLocationString = () => {
        if (job.location_details && job.location_details.length > 0) {
            return job.location_details.map(loc => loc.city).join(", ");
        }
        return "Toàn quốc";
    };

    useEffect(() => {
        const loadJob = async () => {
            try {
                const res = await Apis.get(endpoints['job-detail'](job_id));
                setJob(res.data)
                console.log(res.data);
            } catch (ex) {
                console.log(ex);
            }
        };
        loadJob();
    }, [])


    const handleApply = () => {
        if (user === null) {
            Alert.alert(
                "Yêu cầu đăng nhập",
                "Bạn cần đăng nhập để thực hiện ứng tuyển công việc này.",
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Đăng nhập ngay",
                        onPress: () => navigation.navigate("Login") // Đảm bảo route tên là "Login"
                    }
                ]
            );
            return;
        }

        // 2. Nếu đã đăng nhập thì chuyển sang trang nộp đơn
        navigation.navigate("ApplyJob", { jobId: job.id });
    };

    const addToCompare = async () => {
        try {
            if (!job || !job.id) {
                Alert.alert("Chưa sẵn sàng", "Dữ liệu công việc đang tải, vui lòng thử lại sau.");
                return;
            }

            const currentListStr = await AsyncStorage.getItem('compare_list');
            let currentList = currentListStr ? JSON.parse(currentListStr) : [];

            const jobId = job.id;

            if (currentList.includes(jobId)) {
                Alert.alert("Thông báo", "Công việc này đã có trong danh sách so sánh.");
                return;
            }

            if (currentList.length >= 5) {
                Alert.alert("Giới hạn", "Chỉ được so sánh tối đa 5 công việc. Vui lòng xóa bớt.");
                return;
            }

            currentList.push(jobId);

            await AsyncStorage.setItem('compare_list', JSON.stringify(currentList));

            Alert.alert(
                "Thành công",
                `Đã thêm vào danh sách so sánh (${currentList.length}/5).`,
                [
                    { text: "Đóng", style: "cancel" },
                    {
                        text: "Xem so sánh ngay",
                        onPress: () => navigation.navigate("CompareJobs", { jobIds: currentList })
                    }
                ]
            );

        } catch (e) {
            console.error("Lỗi addToCompare:", e);
            Alert.alert("Lỗi", "Không thể lưu vào danh sách so sánh.");
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1976D2" /></View>;

    return (
        <View style={{ flex: 1, backgroundColor: 'white', marginTop: 30 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                {/* Header ảnh bìa */}
                <View style={styles.header}>
                    <Avatar.Image size={80} source={{ uri: job.recruiter_detail?.logo }} style={{ backgroundColor: 'white' }} />
                </View>

                <View style={styles.content}>
                    <Text variant="headlineSmall" style={styles.title}>{job.title}</Text>
                    <Text variant="titleMedium" style={{ color: '#555', marginBottom: 10 }}>
                        {job.recruiter_detail?.company_name}
                    </Text>

                    <Divider style={{ marginVertical: 15 }} />

                    <Section title="Mô tả công việc" content={job.description} />
                    <Section title="Lợi ích" content={job.benefits} />
                    <Section title="Yêu cầu" content={job.requirements} />

                    <Section title="Thông tin chung">
                        <InfoRow label="Địa điểm:" value={getLocationString()} />
                        <InfoRow
                            label="Lương:"
                            value={job.salary || "Thỏa thuận"}
                        />
                        <InfoRow label="Hạn nộp:" value={moment(job.deadline).format("DD/MM/YYYY")} />
                        <InfoRow label="Ngày đăng:" value={moment(job.created_at, "DD-MM-YYYY HH:mm:ss").fromNow()} />
                    </Section>
                </View>
            </ScrollView>
            <View style={styles.bottomBar}>
                {/* Nút So sánh (Màu cam/vàng để phân biệt) */}
                <Button
                    mode="outlined"
                    icon="scale-balance"
                    style={[styles.btnAction, { borderColor: '#1976D2' }]}
                    textColor="#1976D2"
                    onPress={addToCompare}
                >
                    So sánh
                </Button>

                <View style={{ marginTop: 10 }} />

                {/* Nút Ứng tuyển */}
                <Button
                    mode="contained"
                    icon="send"
                    style={[styles.btnAction, { backgroundColor: '#1976D2' }]}
                    onPress={handleApply} // Dùng lại hàm cũ của bạn
                >
                    Ứng tuyển
                </Button>
            </View>
        </View>
    );
};

const Section = ({ title, content, children }) => (
    <View style={{ marginBottom: 20 }}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#333', marginBottom: 5 }}>{title}</Text>
        {content ? <Text style={{ lineHeight: 22, color: '#444' }}>{content}</Text> : children}
    </View>
);

const InfoRow = ({ label, value }) => (
    <View style={{ flexDirection: 'row', marginBottom: 5 }}>
        <Text style={{ fontWeight: '600', width: 100 }}>{label}</Text>
        <Text>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { height: 120, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    content: { paddingHorizontal: 20 },
    title: { fontWeight: 'bold', color: '#1976D2' },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', padding: 15, elevation: 10, borderTopWidth: 1, borderColor: '#eee'
    },
    applyBtn: { paddingVertical: 5, backgroundColor: '#1976D2' }
});

export default JobDetail;