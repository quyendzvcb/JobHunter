import React, { useState, useCallback, useContext } from "react";
import { View, FlatList, RefreshControl, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Text, Card, FAB, ActivityIndicator, Avatar, IconButton, Chip } from "react-native-paper";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import Apis, { endpoints } from "../../utils/Apis";
import moment from "moment";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RecruiterHome = () => {
    const [user] = useContext(MyUserContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ active: 0, total_views: 0, total_apps: 0 });
    const nav = useNavigation();
    const isFocused = useIsFocused();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Lấy danh sách Job
            let res = await Apis.get(endpoints['jobs']);
            // Lọc job của chính recruiter này (nếu API trả về all)
            const myJobs = res.data.results.filter(j => j.recruiter?.id === user.id || j.recruiter === user.id);
            setJobs(myJobs);

            // 2. Tính toán Stats (Giả lập từ client)
            setStats({
                active: myJobs.filter(j => j.is_active).length,
                total_views: myJobs.reduce((sum, j) => sum + (j.views || 0), 0),
                total_apps: 0 // Cần API đếm số ứng viên để chính xác
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Gọi lại mỗi khi màn hình được focus
    React.useEffect(() => {
        if (isFocused) loadData();
    }, [isFocused, loadData]);

    // Header thống kê
    const renderHeader = () => (
        <View>
            {/* Header Chào mừng */}
            <View style={styles.headerBar}>
                <View>
                    <Text variant="titleMedium" style={{ color: 'white', fontWeight: 'bold' }}>Dashboard</Text>
                    <Text style={{ color: '#e3f2fd', fontSize: 13 }}>Xin chào, {user.last_name}</Text>
                </View>
                <Avatar.Image size={45} source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} />
            </View>

            {/* Các ô Thống kê */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#1976D2' }]}>{stats.active}</Text>
                    <Text style={styles.statLabel}>Tin đang mở</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#eee' }]}>
                    <Text style={[styles.statNum, { color: 'green' }]}>{stats.total_apps}</Text>
                    <Text style={styles.statLabel}>Hồ sơ nhận</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: 'orange' }]}>{stats.total_views}</Text>
                    <Text style={styles.statLabel}>Lượt xem</Text>
                </View>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>Quản lý tin đăng ({jobs.length})</Text>
        </View>
    );

    // Item Job
    const renderJobItem = ({ item }) => (
        <Card style={styles.card} mode="elevated" onPress={() => console.log("Xem chi tiết Job")}>
            <Card.Content>
                <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.date}>Ngày đăng: {moment(item.created_at).format("DD/MM/YYYY")}</Text>
                    </View>
                    <Chip style={{ backgroundColor: item.is_active ? '#e8f5e9' : '#ffebee' }} textStyle={{ fontSize: 11, color: item.is_active ? 'green' : 'red' }}>
                        {item.is_active ? 'Đang tuyển' : 'Đã đóng'}
                    </Chip>
                </View>

                <View style={[styles.rowBetween, { marginTop: 10 }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialCommunityIcons name="eye-outline" size={16} color="gray" />
                        <Text style={styles.metaText}> {item.views || 0} lượt xem</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon="pencil" size={20} iconColor="#1976D2" onPress={() => Alert.alert("Sửa", "Sửa job này")} />
                        <IconButton icon="delete" size={20} iconColor="#d32f2f" onPress={() => Alert.alert("Xóa", "Xóa job này")} />
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={jobs}
                keyExtractor={item => item.id.toString()}
                renderItem={renderJobItem}
                ListHeaderComponent={renderHeader}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#1976D2']} />}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Nút FAB đăng tin */}
            <FAB
                icon="plus"
                label="Đăng tin"
                style={styles.fab}
                color="white"
                onPress={() => Alert.alert("Navigate", "Chuyển sang màn hình CreateJob")}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    headerBar: { backgroundColor: '#1976D2', padding: 20, paddingTop: 50, paddingBottom: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statsContainer: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 16, marginTop: -30, borderRadius: 12, padding: 15, elevation: 4 },
    statBox: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 22, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: 'gray', marginTop: 4 },
    sectionTitle: { margin: 16, marginBottom: 8, fontWeight: 'bold', color: '#333' },
    card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: 'white', borderRadius: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    date: { fontSize: 12, color: '#666' },
    metaText: { fontSize: 13, color: 'gray' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#1976D2' },
});

export default RecruiterHome;