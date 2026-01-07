import React, { useContext, useEffect, useState } from "react";
import { View, FlatList, Image, RefreshControl, Alert } from "react-native";
import { Text, Card, Chip, ActivityIndicator, Avatar, Button } from "react-native-paper";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Activity = () => {
    const [user] = useContext(MyUserContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const nav = useNavigation();

    // Hàm load dữ liệu tùy theo vai trò
    const loadData = async () => {

        setLoading(true);
        try {
            // Backend Django đã tự lọc:
            // - Nếu là Recruiter: Trả về danh sách Application của Job do mình đăng
            // - Nếu là Applicant: Trả về danh sách Application mình đã nộp
            const res = await authApis(user.token).get(endpoints['applications']);
            setItems(res.data.results);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Chỉ load dữ liệu khi màn hình được focus VÀ người dùng đã đăng nhập thành công
        if (isFocused && user && user.token) {
            loadData();
        } else if (isFocused && !user) {
            setItems([]); // Xóa dữ liệu cũ nếu đăng xuất
        }
    }, [isFocused, user]);

    // Giao diện khi CHƯA ĐĂNG NHẬP
    if (!user) {
        return (
            <View style={[MyStyles.container, MyStyles.center, { padding: 30 }]}>
                <MaterialCommunityIcons name="lock-alert" size={80} color="#ccc" />
                <Text style={{ marginTop: 20, color: 'gray', textAlign: 'center' }}>
                    Vui lòng đăng nhập để xem lịch sử ứng tuyển hoặc quản lý hồ sơ ứng viên.
                </Text>
                <Button mode="contained" onPress={() => nav.navigate("Login")} style={MyStyles.btnPrimary}>
                    Đăng nhập ngay
                </Button>
            </View>
        );
    }

    // ITEM CHO NHÀ TUYỂN DỤNG (Xem Ứng viên)
    const renderRecruiterItem = ({ item }) => (
        <Card style={MyStyles.card}>
            <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    {/* Avatar Ứng viên */}
                    <Avatar.Image
                        size={50}
                        source={{ uri: item.applicant?.user?.avatar || 'https://via.placeholder.com/150' }}
                    />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            {item.applicant?.user?.last_name} {item.applicant?.user?.first_name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: 'gray' }}>
                            Ứng tuyển: <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.job?.title}</Text>
                        </Text>
                    </View>
                </View>

                <View style={{ backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5 }}>
                    <Text variant="bodySmall" numberOfLines={2}>
                        <Text style={{ fontWeight: 'bold' }}>Cover Letter: </Text>
                        {item.cover_letter || "Không có thư giới thiệu"}
                    </Text>
                </View>

                <View style={[MyStyles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
                    <Chip icon="clock-outline" style={{ backgroundColor: '#e3f2fd' }}>
                        {moment(item.created_at).fromNow()}
                    </Chip>
                    {/* Status Badge */}
                    <Chip
                        style={{ backgroundColor: item.status === 'PENDING' ? '#fff3e0' : '#e8f5e9' }}
                        textStyle={{ color: item.status === 'PENDING' ? 'orange' : 'green' }}
                    >
                        {item.status}
                    </Chip>
                </View>
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                <Button textColor="#d32f2f" onPress={() => Alert.alert("Tính năng", "Xem chi tiết CV/Duyệt hồ sơ")}>
                    Xem CV
                </Button>
            </Card.Actions>
        </Card>
    );

    // ITEM CHO ỨNG VIÊN (Xem việc đã nộp)
    const renderApplicantItem = ({ item }) => (
        <Card style={MyStyles.card}>
            <Card.Content>
                <View style={{ flexDirection: 'row' }}>
                    <Image
                        source={{ uri: item.job?.recruiter?.logo || 'https://via.placeholder.com/60' }}
                        style={{ width: 50, height: 50, borderRadius: 5, marginRight: 15 }}
                        resizeMode="contain"
                    />
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.job?.title}</Text>
                        <Text variant="bodySmall" style={{ color: 'gray' }}>{item.job?.recruiter?.company_name}</Text>
                        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, color: '#aaa' }}>{moment(item.created_at).format("DD/MM/YYYY")}</Text>
                            <Text style={{ fontWeight: 'bold', color: item.status === 'PENDING' ? 'orange' : 'green' }}>
                                {item.status === 'PENDING' ? 'Đang chờ duyệt' : item.status}
                            </Text>
                        </View>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={MyStyles.container}>
            {/* Header */}
            <View style={{ padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {user.role === 'RECRUITER' ? 'Hồ Sơ Ứng Viên' : 'Việc Làm Đã Nộp'}
                </Text>
            </View>

            {/* List */}
            <View style={{ flex: 1, padding: 10 }}>
                {items.length === 0 && !loading ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <MaterialCommunityIcons name="folder-open-outline" size={60} color="#ddd" />
                        <Text style={{ color: 'gray', marginTop: 10 }}>Chưa có dữ liệu nào.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={item => item.id.toString()}
                        renderItem={user.role === 'RECRUITER' ? renderRecruiterItem : renderApplicantItem}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

export default Activity;