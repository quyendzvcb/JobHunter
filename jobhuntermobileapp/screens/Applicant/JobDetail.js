import React, { useContext, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/vi';
import { MyUserContext } from '../../utils/contexts/MyUserContext';

const JobDetail = ({ route, navigation }) => {
    const { job } = route.params;
    const [user] = useContext(MyUserContext); // user sẽ là null nếu chưa đăng nhập
    const [loading, setLoading] = useState(false);

    const getLocationString = () => {
        if (job.location_details && job.location_details.length > 0) {
            return job.location_details.map(loc => loc.city).join(", ");
        }
        return "Toàn quốc";
    };

    const handleApply = () => {
        // 1. Kiểm tra đăng nhập
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

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1976D2" /></View>;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
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
                    <Section title="Yêu cầu" content={job.requirements} />

                    <Section title="Thông tin chung">
                        <InfoRow label="Địa điểm:" value={getLocationString()} />
                        <InfoRow
                            label="Lương:"
                            value={job.salary || "Thỏa thuận"}
                        />
                        <InfoRow label="Hạn nộp:" value={moment(job.deadline).format("DD/MM/YYYY")} />
                        <InfoRow label="Ngày đăng:" value={moment(job.created_at).fromNow()} />
                    </Section>
                </View>
            </ScrollView>
            <View style={styles.bottomBar}>
                <Button
                    mode="contained"
                    icon="send"
                    style={styles.applyBtn}
                    onPress={handleApply}
                >
                    Ứng tuyển ngay
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