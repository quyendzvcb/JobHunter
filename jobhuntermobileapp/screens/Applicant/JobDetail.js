import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, useWindowDimensions, Image, Alert, StyleSheet } from "react-native";
import { Text, Button, Card, Chip, Divider, IconButton } from 'react-native-paper';
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JobDetail = ({ route }) => {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const { width } = useWindowDimensions();
    const [user] = useContext(MyUserContext);
    const nav = useNavigation(); // Thêm hook navigation

    useEffect(() => {
        const load = async () => {
            try {
                const res = await Apis.get(endpoints['job-detail'](jobId));
                setJob(res.data);
            } catch (e) { console.error(e); }
        }
        load();
    }, [jobId]);

    const apply = async () => {
        // LOGIC MỚI: Nếu chưa đăng nhập -> Chuyển sang Login, dặn Login xong thì quay lại đây
        if (!user) {
            Alert.alert(
                "Yêu cầu đăng nhập",
                "Bạn cần đăng nhập để ứng tuyển công việc này.",
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Đăng nhập ngay",
                        onPress: () => nav.navigate("Login", { next: "JobDetail", params: { jobId: jobId } })
                    }
                ]
            );
            return;
        }
        try {
            nav.navigate("ApplyJob", { jobId: job.id });
        } catch (e) {
            console.error("Lỗi điều hướng:", e); // Xem lỗi cụ thể ở đây
            Alert.alert("Lỗi", "Không thể mở màn hình ứng tuyển.");
        }
    }

    if (!job) return <Text style={{ padding: 20 }}>Đang tải...</Text>;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                {/* 1. Header Section */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: job.recruiter_detail?.logo || 'https://via.placeholder.com/80' }}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.recruiter_detail?.company_name}</Text>
                    <Text style={styles.salary}>
                        {job.salary}
                    </Text>
                </View>
                <View style={styles.tagContainer}>
                    {job.location_details?.map(loc => (
                        <Chip key={loc.id} icon="map-marker" style={styles.chip}>{loc.city}</Chip>
                    ))}
                    <Chip icon="briefcase" style={styles.chip}>{job.category_detail?.name}</Chip>
                </View>

                <Divider style={styles.divider} />

                {/* 3. Detailed Info Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#666" />
                            <Text style={styles.infoText}>Hạn nộp: {job.deadline}</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* 4. Job Content */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả công việc</Text>
                    <Text style={styles.bodyText}>{job.description || "Đang cập nhật..."}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Yêu cầu ứng viên</Text>
                    <Text style={styles.bodyText}>{job.requirements || "Trao đổi trực tiếp khi phỏng vấn"}</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* 5. Fixed Footer Actions */}
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    style={styles.applyBtn}
                    contentStyle={{ height: 50 }}
                    onPress={apply}
                >
                    ỨNG TUYỂN NGAY
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    logo: { width: 80, height: 80, borderRadius: 10, marginBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    companyName: { fontSize: 16, color: '#666', marginTop: 5 },
    salary: { fontSize: 18, color: '#2ecc71', fontWeight: 'bold', marginTop: 10 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10 },
    chip: { margin: 4, backgroundColor: '#f0f0f0' },
    divider: { marginVertical: 20 },
    card: { backgroundColor: '#f9f9f9', elevation: 0, borderRadius: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { marginLeft: 10, color: '#444' },
    section: { marginTop: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    bodyText: { fontSize: 15, lineHeight: 24, color: '#555' },
    footer: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    applyBtn: { flex: 1, marginLeft: 10, borderRadius: 8, backgroundColor: '#2563eb' }
});
export default JobDetail;