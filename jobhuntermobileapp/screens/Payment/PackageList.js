import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../utils/Apis';
import RenderHTML from "react-native-render-html";

const PackageList = ({ route, navigation }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { jobId } = route.params || {};

    const { width } = useWindowDimensions();


    useEffect(() => {
        const loadPackages = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints['packages']);
                setPackages(res.data);
            } catch (err) {
                console.log(err);
                Alert.alert("Lỗi", "Không thể tải danh sách gói dịch vụ.");
            } finally {
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    const goToPayment = (pkgId) => {
        navigation.navigate("CreatePayment", { packageId: pkgId, jobId: jobId });
    };

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
                            <Chip style={styles.priceChip}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                            </Chip>
                        </View>
                        <View style={styles.desc}>
                            <RenderHTML contentWidth={width} source={{ 'html': pkg.description }} />
                        </View>

                        <Button
                            mode="contained"
                            onPress={() => goToPayment(pkg.id)}
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
        marginBottom: 20,
    },

    card: {
        marginBottom: 15,
        backgroundColor: 'white',
        elevation: 3,
        borderRadius: 12,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    pkgTitle: {
        fontWeight: 'bold',
        color: '#2563eb',
        fontSize: 19,
    },

    priceChip: {
        backgroundColor: '#e0f2fe',
        height: 32,
    },

    desc: {
        marginBottom: 10,
    },

    btnBuy: {
        backgroundColor: '#2563eb',
        marginTop: 10,
        borderRadius: 8,
    },
});

export default PackageList;