import React, { useContext, useState } from "react";
import { View, ScrollView, Alert, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar, Text, Button, Chip, Card, Divider, ActivityIndicator, List } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

import { MyUserContext } from "../../utils/contexts/MyUserContext";
import MyStyles from "../../styles/MyStyles";
import { authApis, endpoints } from "../../utils/Apis";

const Profile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);

    // Hàm xử lý đăng xuất
    const logout = () => {
        Alert.alert("Đăng xuất", "Bạn muốn đăng xuất?", [
            { text: "Hủy" },
            { text: "Đồng ý", onPress: () => dispatch({ type: "logout" }) }
        ]);
    };

    // Hàm xử lý nâng cấp Premium
    const handleUpgrade = async () => {
        Alert.alert(
            "Nâng cấp Premium",
            "Bạn có muốn nâng cấp lên tài khoản VIP với giá 500.000 VNĐ? \n\nQuyền lợi:\n- Huy hiệu VIP\n- Ưu tiên hiển thị hồ sơ\n- Xem được nhiều việc làm hơn",
            [
                { text: "Để sau", style: "cancel" },
                {
                    text: "Thanh toán & Nâng cấp",
                    onPress: async () => {
                        processUpgrade();
                    }
                }
            ]
        );
    };

    const processUpgrade = async () => {
        setLoading(true);
        try {
            // 1. Gọi API thực tế (nếu có backend hỗ trợ)
            const token = await AsyncStorage.getItem('token');
            // Ví dụ: await authApis(token).post(endpoints['upgrade-premium']); 

            // --- GIẢ LẬP LOGIC SERVER ---
            // Ở đây mình giả lập gọi API thành công sau 1.5 giây
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Cập nhật Context (Local State)
            // Tạo đối tượng user mới với trường is_premium = true
            const updatedUser = { ...user, is_premium: true };

            dispatch({
                type: "login",
                payload: updatedUser
            });

            Alert.alert("Thành công", "Chúc mừng! Bạn đã trở thành thành viên Premium.");

        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Giao dịch thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Giao diện khi chưa đăng nhập
    if (!user) {
        return (
            <View style={[MyStyles.container, MyStyles.center, { padding: 30 }]}>
                <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" }} style={{ width: 120, height: 120, opacity: 0.5, marginBottom: 20 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Bạn chưa đăng nhập</Text>
                <View style={{ width: '100%' }}>
                    <Button mode="contained" style={MyStyles.btnPrimary} onPress={() => nav.navigate("Login")}>ĐĂNG NHẬP</Button>
                    <Button mode="outlined" style={MyStyles.btnOutline} textColor="#1976D2" onPress={() => nav.navigate("Register")}>ĐĂNG KÝ</Button>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={MyStyles.container}>
            {/* === HEADER GIỐNG ẢNH MẪU === */}
            <View style={styles.headerCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Avatar bên trái */}
                    <View>
                        <Avatar.Image
                            size={70}
                            source={{ uri: user.avatar || user.recruiter?.logo || 'https://via.placeholder.com/150' }}
                            style={{ backgroundColor: '#e0e0e0' }}
                        />
                        {/* Icon máy ảnh nhỏ (trang trí) */}
                        <View style={styles.cameraIconBg}>
                            <MaterialCommunityIcons name="camera" size={12} color="white" />
                        </View>
                    </View>

                    {/* Thông tin bên phải */}
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.userName}>
                                {user.role === 'RECRUITER' ? user.recruiter?.company_name : `${user.last_name} ${user.first_name}`}
                            </Text>
                            {/* Logic hiển thị Vương Miện nếu là Premium */}
                            {user.is_premium && (
                                <MaterialCommunityIcons name="crown" size={20} color="#FFD700" style={{ marginLeft: 5 }} />
                            )}
                        </View>

                        <Text style={styles.userCode}>Mã: {user.id} - @{user.username}</Text>

                        {/* Nút Nâng cấp tài khoản (Chỉ hiện khi chưa Premium) */}
                        {!user.is_premium ? (
                            <TouchableOpacity
                                style={styles.upgradeBtnSmall}
                                onPress={() => nav.navigate('PackageList')} 
                            >
                                <MaterialCommunityIcons name="arrow-up-bold-circle" size={16} color="#4b5563" />
                                <Text style={styles.upgradeText}>Nâng cấp tài khoản</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.premiumTag}>
                                <Text style={{ color: '#b45309', fontWeight: 'bold', fontSize: 12 }}>Thành viên Premium</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* === MENU CHỨC NĂNG === */}
            <View style={{ padding: 15 }}>
                {/* Menu Lịch sử thanh toán */}
                <List.Item
                    title="Lịch sử thanh toán"
                    description="Xem lại các giao dịch đã thực hiện"
                    left={props => <List.Icon {...props} icon="history" color="#2563eb" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => nav.navigate('PaymentHistory')}
                    style={styles.menuItem}
                />

                <Divider style={{ marginVertical: 10 }} />

                {/* Các nút cũ */}
                <Button
                    mode="outlined"
                    style={MyStyles.btnOutline}
                    textColor="#1976D2"
                    onPress={() => nav.navigate("ActivityTab", { screen: 'ApplicationList' })}>
                    {user.role === 'RECRUITER' ? 'QUẢN LÝ ỨNG VIÊN' : 'XEM LỊCH SỬ ỨNG TUYỂN'}
                </Button>
                <Button mode="contained" onPress={logout} style={{ backgroundColor: '#555', marginTop: 10 }}>ĐĂNG XUẤT</Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        // Đổ bóng nhẹ giống ảnh mẫu
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cameraIconBg: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#333',
        padding: 4,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white'
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    userCode: {
        fontSize: 13,
        color: '#6b7280',
        marginVertical: 4
    },
    // Style cho nút nâng cấp nhỏ màu xám
    upgradeBtnSmall: {
        backgroundColor: '#e5e7eb', // Màu xám nhạt
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start', // Co lại vừa nội dung
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    upgradeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 5
    },
    premiumTag: {
        backgroundColor: '#fef3c7',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#fcd34d'
    },
    menuItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10
    }
});

export default Profile;