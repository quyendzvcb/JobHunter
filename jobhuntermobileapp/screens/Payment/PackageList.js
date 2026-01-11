import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, Alert, Linking, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authApis, endpoints } from '../../utils/Apis';
import { MyUserContext } from '../../utils/contexts/MyUserContext';
import RenderHTML from "react-native-render-html";

const PackageList = ({ navigation }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyUserContext);

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints['packages']);
                setPackages(res.data);
            } catch (err) {
                console.error(err);
                Alert.alert("Lỗi", "Không thể tải danh sách gói dịch vụ.");
            }
        };
        loadPackages();
    }, []);

    const handleBuy = async (pkg) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            const res = await authApis(token).post(endpoints['create-payment'], {
                package_id: pkg.id,
                payment_method: 'MOMO'
            });

            const paymentUrl = res.data.payment_url;

            if (paymentUrl) {
                // Cách đơn giản nhất: Mở trình duyệt ngoài/App MoMo
                const supported = await Linking.canOpenURL(paymentUrl);
                if (supported) {
                    await Linking.openURL(paymentUrl);

                    // 4. Giả lập quy trình kiểm tra sau khi quay lại app
                    // Trong thực tế, bạn cần xử lý Deep Link hoặc nút "Tôi đã thanh toán" để check lại trạng thái
                    Alert.alert(
                        "Xác nhận thanh toán",
                        "Sau khi thanh toán thành công trên MoMo, vui lòng nhấn 'Hoàn tất' để cập nhật tài khoản.",
                        [
                            { text: "Hủy", style: 'cancel' },
                            {
                                text: "Hoàn tất",
                                onPress: () => checkPaymentStatus()
                            }
                        ]
                    );
                }
            } else {
                Alert.alert("Lỗi", "Không lấy được link thanh toán.");
            }

        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo giao dịch.");
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['current-user']);

            // Cập nhật Context
            dispatch({
                type: "login",
                payload: res.data
            });

            if (res.data.is_premium) {
                Alert.alert("Thành công", "Tài khoản đã được nâng cấp!");
                navigation.goBack();
            } else {
                Alert.alert("Thông báo", "Giao dịch chưa hoàn tất hoặc đang xử lý.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    console.log(packages)

    if (loading && packages.length === 0)
        return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#2563eb' }}>Gói Nâng Cấp</Text>
                <Text style={{ color: 'gray' }}>Chọn gói phù hợp với nhu cầu của bạn</Text>
            </View>

            {packages.map((pkg) => (
                <Card key={pkg.id} style={styles.card}>
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <Text variant="titleLarge" style={styles.pkgTitle}>{pkg.name}</Text>
                            <Chip style={styles.priceChip}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}</Chip>
                        </View>
                        <Text style={styles.desc}>
                            <RenderHTML source={{ 'html': pkg.description }} />
                        </Text>

                        <Button
                            mode="contained"
                            onPress={() => handleBuy(pkg)}
                            style={styles.btnBuy}
                            icon="credit-card-outline"
                        >
                            Thanh toán
                        </Button>
                    </Card.Content>
                </Card>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 20 },
    card: { marginBottom: 15, backgroundColor: 'white', elevation: 3, borderRadius: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    pkgTitle: { fontWeight: 'bold', color: '#2563eb', fontSize: 19 },
    priceChip: { backgroundColor: '#e0f2fe', height: 32 },
    desc: { color: '#666', marginBottom: 10 },
    btnBuy: { backgroundColor: '#2563eb', marginTop: 10, borderRadius: 8 },
});

export default PackageList;