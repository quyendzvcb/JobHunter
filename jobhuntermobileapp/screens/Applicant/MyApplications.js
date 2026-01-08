import React, { useContext, useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl, Image, TouchableOpacity, Alert, StyleSheet, Linking } from "react-native";
import { Text, Card, Chip, Avatar, Button, Divider, ActivityIndicator, Badge } from "react-native-paper";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from "moment";
import 'moment/locale/vi';

import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { authApis, endpoints } from "../../utils/Apis";

moment.locale('vi');

const MyApplications = () => {
    const [user] = useContext(MyUserContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('PENDING'); // State lưu Tab hiện tại: 'PENDING', 'APPROVED', 'REJECTED'
    const isFocused = useIsFocused();
    const nav = useNavigation();

    // Định nghĩa các trạng thái
    const TAB_STATUS = {
        PENDING: ['PENDING'],
        APPROVED: ['ACCEPTED', 'HIRED'],
        REJECTED: ['REJECTED']
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED': return '#4caf50';
            case 'HIRED': return '#2e7d32';
            case 'REJECTED': return '#ef5350';
            case 'PENDING': default: return '#ff9800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'Được chấp nhận';
            case 'HIRED': return 'Đã tuyển';
            case 'REJECTED': return 'Bị từ chối';
            case 'PENDING': default: return 'Đang chờ duyệt';
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['my-applications'] || endpoints['applications']); // Fallback nếu quên sửa key

            let data = [];
            if (res.data && res.data.results) {
                data = res.data.results;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            setItems(data);
        } catch (e) {
            console.error("Lỗi tải application:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isFocused && user) {
            loadData();
        }
    }, [isFocused, user, loadData]);

    const filteredItems = items.filter(item => TAB_STATUS[selectedTab].includes(item.status));

    const RenderTab = ({ title, tabKey }) => (
        <TouchableOpacity
            style={[styles.tabItem, selectedTab === tabKey && styles.activeTabItem]}
            onPress={() => setSelectedTab(tabKey)}
        >
            <Text style={[styles.tabText, selectedTab === tabKey && styles.activeTabText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <View style={[styles.container, styles.center]}>
                <MaterialCommunityIcons name="lock-alert-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem lịch sử.</Text>
                <Button mode="contained" onPress={() => nav.navigate("Login")} style={styles.btnPrimary}>
                    Đăng nhập ngay
                </Button>
            </View>
        );
    }

    const openCV = (url) => {
        if (url) Linking.openURL(url).catch(err => Alert.alert("Lỗi", "Không thể mở file này"));
        else Alert.alert("Thông báo", "Không tìm thấy file CV");
    };

    // ITEM NHÀ TUYỂN DỤNG
    const renderRecruiterItem = ({ item }) => (
        <Card style={styles.card} mode="elevated">
            <Card.Content>
                <View style={styles.row}>
                    <Avatar.Image size={55} source={{ uri: item.applicant_detail?.avatar || 'https://via.placeholder.com/150' }} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text variant="titleMedium" style={styles.boldText}>
                            {item.applicant_detail?.full_name || item.applicant_detail?.first_name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                            Vị trí: <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>{item.job_detail?.title}</Text>
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#888', marginTop: 2 }}>
                            <MaterialCommunityIcons name="clock-outline" size={12} /> {moment(item.created_at).fromNow()}
                        </Text>
                    </View>
                </View>
                <Divider style={{ marginVertical: 10 }} />
                <Text numberOfLines={2} style={{ fontStyle: 'italic', color: '#555', marginBottom: 10 }}>
                    "{item.cover_letter || 'Không có thư giới thiệu...'}"
                </Text>
                <View style={[styles.row, { justifyContent: 'space-between' }]}>
                    <Chip icon="file-document-outline" onPress={() => openCV(item.applicant_detail.cv_url)} style={{ backgroundColor: '#e3f2fd' }}>Xem CV</Chip>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) + '20' }} textStyle={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>
                        {getStatusLabel(item.status)}
                    </Chip>
                </View>
            </Card.Content>
        </Card>
    );

    // ITEM ỨNG VIÊN
    const renderApplicantItem = ({ item }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={() => nav.navigate("JobDetail", { jobId: item.job_detail?.id || item.job?.id })}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={styles.boldText} numberOfLines={2}>
                                {item.job_detail?.title || item.job?.title}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666', marginBottom: 4 }}>
                                {item.job_detail?.company_name || item.job?.recruiter?.company_name}
                            </Text>
                            <View style={[styles.row, { marginTop: 5 }]}>
                                <MaterialCommunityIcons name="circle-medium" color={getStatusColor(item.status)} size={18} />
                                <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold', fontSize: 13 }}>
                                    {getStatusLabel(item.status)}
                                </Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 11, color: '#aaa' }}>{moment(item.created_at).format("DD/MM")}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                    {user.role === 'RECRUITER' ? 'Hồ Sơ Ứng Viên' : 'Lịch Sử Ứng Tuyển'}
                </Text>
            </View>

            {/* TAB BAR */}
            <View style={styles.tabContainer}>
                <RenderTab title="Đang chờ" tabKey="PENDING" />
                <RenderTab title="Đã duyệt" tabKey="APPROVED" />
                <RenderTab title="Từ chối" tabKey="REJECTED" />
            </View>

            {/* List */}
            <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
                {loading && items.length === 0 ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#1976D2" />
                ) : (
                    <FlatList
                        data={filteredItems}
                        keyExtractor={item => item.id.toString()}
                        renderItem={user.role === 'RECRUITER' ? renderRecruiterItem : renderApplicantItem}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={["#1976D2"]} />}
                        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={[styles.center, { marginTop: 50 }]}>
                                <Image
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }}
                                    style={{ width: 80, height: 80, opacity: 0.5, marginBottom: 15 }}
                                />
                                <Text style={styles.emptyText}>Không có hồ sơ nào ở mục này</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', marginTop: 30 },
    header: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontWeight: 'bold', color: '#1f2937' },

    // Style Tab
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center' },
    activeTabItem: { borderBottomColor: '#1976D2' },
    tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
    activeTabText: { color: '#1976D2', fontWeight: 'bold' },
    tabBadge: { marginLeft: 6, backgroundColor: '#f44336', color: 'white', fontSize: 10, fontWeight: 'bold' },

    card: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#eee' },
    row: { flexDirection: 'row', alignItems: 'center' },
    boldText: { fontWeight: '700', color: '#333' },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    emptyText: { color: 'gray', fontSize: 15 },
    btnPrimary: { backgroundColor: '#1976D2', marginTop: 20, borderRadius: 6 },
});

export default MyApplications;