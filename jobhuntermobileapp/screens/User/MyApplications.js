import React, { useContext, useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Text, Card, Chip, Avatar, Button, Divider, ActivityIndicator } from "react-native-paper";
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
    const [selectedTab, setSelectedTab] = useState('PENDING');


    const isFocused = useIsFocused();
    const nav = useNavigation();

    const TAB_STATUS = {
        PENDING: ['PENDING'],
        APPROVED: ['ACCEPTED', 'HIRED'],
        REJECTED: ['REJECTED']
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED': case 'HIRED': return '#4caf50';
            case 'REJECTED': return '#ef5350';
            default: return '#ff9800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'Đã duyệt';
            case 'HIRED': return 'Đã tuyển';
            case 'REJECTED': return 'Từ chối';
            default: return 'Chờ duyệt';
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['my-applications']);
            let data = res.data.results || res.data || [];
            setItems(data);
        } catch (e) {
            console.error("Lỗi tải application:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isFocused && user) loadData();
    }, [isFocused, user, loadData]);

    const filteredItems = items.filter(item => TAB_STATUS[selectedTab]?.includes(item.status));

    // --- RENDER ITEM RECRUITER (ĐÃ SỬA: Hiển thị Tên + SĐT, bấm vào chuyển trang) ---
    const renderRecruiterItem = ({ item }) => {
        const applicantName = `${item.applicant_detail?.full_name}`;
        const phone = item.applicant_detail?.phone_number || "Chưa cập nhật SĐT";
        const isPremium = item.applicant_detail?.is_premium || ''

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => nav.navigate("ApplicationDetail", { application: item })}
            >
                <Card style={[
                    styles.card,
                    isPremium && styles.premiumCardBorder
                ]}>

                    {/* Nhãn Premium góc nhỏ */}
                    {isPremium && (
                        <View style={styles.premiumBadge}>
                            <MaterialCommunityIcons name="crown" size={10} color="white" />
                        </View>
                    )}
                    <Card.Content>
                        <View style={styles.row}>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                {/* Hiển thị Họ Tên */}
                                <Text style={styles.boldText}>{applicantName}</Text>

                                {/* Hiển thị SĐT */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <MaterialCommunityIcons name="phone" size={14} color="#666" />
                                    <Text style={{ fontSize: 13, color: '#555', marginLeft: 4 }}>{phone}</Text>
                                </View>

                                <Text style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                                    Vị trí: <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>{item.job_detail?.title}</Text>
                                </Text>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                {item.recruiter_rating > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginLeft: 2 }}>{item.recruiter_rating} Điểm</Text>
                                    </View>
                                )}
                                <Chip style={{ backgroundColor: getStatusColor(item.status) + '20', height: 35 }} textStyle={{ fontSize: 10, color: getStatusColor(item.status) }}>
                                    {getStatusLabel(item.status)}
                                </Chip>
                            </View>
                        </View>
                        <Text style={[styles.dateText, { textAlign: 'right', marginTop: 8 }]}>{moment(item.created_at, "DD-MM-YYYY HH:mm:ss").fromNow()}</Text>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    // --- RENDER ITEM APPLICANT (Giữ nguyên) ---
    const renderApplicantItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.row}>
                    <Avatar.Image size={50} source={{ uri: item.job_detail?.recruiter?.logo || 'https://via.placeholder.com/150' }} style={{ backgroundColor: 'white' }} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.boldText}>{item.job_detail?.title}</Text>
                        <Text style={{ fontSize: 13, color: '#555' }}>{item.job_detail?.company_name}</Text>
                        <View style={[styles.row, { marginTop: 4 }]}>
                            <MaterialCommunityIcons name="circle-medium" color={getStatusColor(item.status)} size={16} />
                            <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold', fontSize: 12 }}>
                                {getStatusLabel(item.status)}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.dateText, { textAlign: 'right', marginTop: 5 }]}>
                    Nộp ngày: {moment(item.created_at).format("DD/MM/YYYY")}
                </Text>
            </Card.Content>
        </Card>
    );

    const RenderTab = ({ title, tabKey }) => (
        <TouchableOpacity
            style={[styles.tabItem, selectedTab === tabKey && styles.activeTabItem]}
            onPress={() => setSelectedTab(tabKey)}
        >
            <Text style={[styles.tabText, selectedTab === tabKey && styles.activeTabText]}>{title}</Text>
            <View style={{ marginLeft: 5, backgroundColor: selectedTab === tabKey ? '#1976D2' : '#eee', paddingHorizontal: 6, borderRadius: 10 }}>
                <Text style={{ fontSize: 10, color: selectedTab === tabKey ? 'white' : '#666', fontWeight: 'bold' }}>
                    {items.filter(i => TAB_STATUS[tabKey].includes(i.status)).length}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (!user) return <View style={[styles.container, styles.center]}><Text>Vui lòng đăng nhập</Text></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleLarge" style={styles.headerTitle}>{user.role === 'RECRUITER' ? 'Quản lý Ứng viên' : 'Lịch Sử Ứng Tuyển'}</Text>
            </View>

            <View style={styles.tabContainer}>
                <RenderTab title="Chờ duyệt" tabKey="PENDING" />
                <RenderTab title="Đã duyệt" tabKey="APPROVED" />
                <RenderTab title="Từ chối" tabKey="REJECTED" />
            </View>

            <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
                {loading && items.length === 0 ? <ActivityIndicator style={{ marginTop: 20 }} color="#1976D2" /> : (
                    <FlatList
                        data={filteredItems}
                        keyExtractor={item => item.id.toString()}
                        renderItem={user.role === 'RECRUITER' ? renderRecruiterItem : renderApplicantItem}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={["#1976D2"]} />}
                        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                        ListEmptyComponent={() => <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>Danh sách trống</Text>}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', marginTop: 30 },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontWeight: 'bold', color: '#1976D2', fontSize: 20 },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 10 },
    tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center' },
    activeTabItem: { borderBottomColor: '#1976D2' },
    tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
    activeTabText: { color: '#1976D2', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 10, elevation: 2, marginHorizontal: 2 },
    row: { flexDirection: 'row', alignItems: 'center' },
    boldText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    dateText: { fontSize: 12, color: '#888', marginTop: 2 },
    premiumCardBorder: {
        borderWidth: 3,
        borderColor: '#FFFDF0',
    },
    premiumBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        zIndex: 1,
    },
    premiumBadgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
        marginLeft: 2,
    },
});

export default MyApplications;