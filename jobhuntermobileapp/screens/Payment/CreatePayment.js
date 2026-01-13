import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, Alert, Linking, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator, RadioButton, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';
import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MyUserContext } from '../../utils/contexts/MyUserContext';

const CreatePayment = ({ route, navigation }) => {
    const { packageId, jobId } = route.params;
    const [packageDetail, setPackageDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const { width } = useWindowDimensions();
    const [, dispatch] = useContext(MyUserContext);

    useEffect(() => {
        const loadPackageDetail = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints['package-detail'](packageId));
                setPackageDetail(res.data);
                if (res.data.payment_methods && res.data.payment_methods.length > 0) {
                    setPaymentMethod(res.data.payment_methods[0].id);
                }
            } catch (err) {
                console.error(err);
                Alert.alert("Lỗi", "Không thể tải thông tin gói dịch vụ.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        loadPackageDetail();
    }, [packageId]);

    const refreshUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['current-user']);

            dispatch({
                type: "login",
                payload: res.data
            });
            console.log("User profile updated!");
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);
        }
    };

    const handlePayment = async () => {
        if (!packageDetail || !paymentMethod) {
            Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán.");
            return;
        }

        try {
            setProcessing(true);
            const token = await AsyncStorage.getItem('token');

            console.log(`Đang thanh toán gói ${packageDetail.id} qua ${paymentMethod}`);

            const res = await authApis(token).post(endpoints['create-payment'], {
                service_package_id: packageDetail.id,
                payment_method: paymentMethod,
                job_id: jobId
            });

            const payUrl = res.data.payUrl || res.data.payment_url;

            if (payUrl) {
                const supported = await Linking.canOpenURL(payUrl);
                if (supported) {
                    await Linking.openURL(payUrl);
                    Alert.alert(
                        "Đang thanh toán",
                        "Sau khi hoàn tất thanh toán trên ứng dụng, vui lòng xác nhận.",
                        [
                            { text: "Để sau", style: 'cancel' },
                            {
                                text: "Đã thanh toán",
                                onPress: async () => {
                                    await refreshUserProfile();
                                    navigation.navigate("PaymentHistory");
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert("Lỗi", "Không thể mở ứng dụng thanh toán.");
                }
            } else if (paymentMethod === 'CASH') {
                Alert.alert("Thành công", "Vui lòng liên hệ bộ phận CSKH để hoàn tất thanh toán tiền mặt.", [
                    { text: "OK", onPress: () => navigation.navigate("PaymentHistory") }
                ]);
            } else {
                Alert.alert("Thông báo", "Yêu cầu thanh toán đang được xử lý.", [
                    { text: "OK", onPress: () => navigation.navigate("PaymentHistory") }
                ]);
            }

        } catch (err) {
            console.error(err);
            const message = err.response?.data?.error || err.response?.data?.detail || "Có lỗi xảy ra khi tạo giao dịch.";
            Alert.alert("Lỗi thanh toán", message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading)
        return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

    return (
        <ScrollView style={styles.container}>
            {packageDetail && (
                <>
                    <View style={styles.header}>
                        <Text variant="headlineSmall" style={styles.headerTitle}>Xác nhận thanh toán</Text>
                    </View>

                    <Card style={styles.card}>
                        <Card.Title title="Thông tin gói dịch vụ" titleStyle={styles.cardTitle} />
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.pkgName}>{packageDetail.name}</Text>
                            <Text variant="headlineMedium" style={styles.price}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(packageDetail.price)}
                            </Text>
                            <View style={styles.htmlContainer}>
                                <RenderHTML
                                    contentWidth={width}
                                    source={{ html: packageDetail.description || '<p>Không có mô tả</p>' }}
                                />
                            </View>
                        </Card.Content>
                    </Card>

                    <Card.Content>
                        {packageDetail.payment_methods && packageDetail.payment_methods.length > 0 ? (
                            <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
                                {packageDetail.payment_methods.map((method, index) => {
                                    const isMomo = method.id === 'MOMO';

                                    return (
                                        <View key={method.id} style={!isMomo ? { opacity: 0.5 } : {}}>
                                            <View style={styles.radioItem}>
                                                <RadioButton
                                                    value={method.id}
                                                    color="#2563eb"
                                                    disabled={!isMomo}
                                                />
                                                <View style={styles.methodInfo}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={styles.methodText}>{method.name}</Text>
                                                    </View>
                                                    {!isMomo && <Text style={styles.subText}>Tạm thời chưa hỗ trợ</Text>}
                                                </View>
                                            </View>
                                            {index < packageDetail.payment_methods.length - 1 && <Divider style={{ marginVertical: 8 }} />}
                                        </View>
                                    );
                                })}
                            </RadioButton.Group>
                        ) : (
                            <Text style={{ fontStyle: 'italic', color: 'gray', textAlign: 'center', padding: 10 }}>
                                Không có phương thức thanh toán khả dụng.
                            </Text>
                        )}
                    </Card.Content>

                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handlePayment}
                            loading={processing}
                            disabled={processing || !paymentMethod}
                            style={styles.btnPay}
                            contentStyle={{ height: 50 }}
                            icon="check-circle-outline"
                        >
                            THANH TOÁN
                        </Button>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    header: {
        marginBottom: 15,
    },

    headerTitle: {
        fontWeight: 'bold',
        color: '#2563eb',
    },

    card: {
        marginBottom: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
    },

    cardTitle: {
        color: '#444',
        fontWeight: 'bold',
    },

    pkgName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    price: {
        color: '#D82D8B',
        fontWeight: 'bold',
        marginVertical: 10,
    },

    htmlContainer: {
        marginTop: 5,
    },

    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },

    methodInfo: {
        marginLeft: 10,
        flex: 1,
    },

    methodText: {
        fontSize: 16,
        fontWeight: '600',
    },

    subText: {
        fontSize: 12,
        color: 'gray',
    },

    footer: {
        marginTop: 10,
        marginBottom: 30,
    },

    btnPay: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
    },
});

export default CreatePayment;