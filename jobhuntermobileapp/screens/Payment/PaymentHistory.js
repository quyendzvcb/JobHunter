import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { authApis, endpoints } from '../../utils/Apis';

const PaymentHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints['payment-history']);
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'SUCCESS') return '#4CAF50';
        if (status === 'PENDING') return '#FF9800';
        return '#F44336';
    };



    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.row}>
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.package_detail.name || "Gói dịch vụ"}</Text>
                        <Text style={{ color: 'gray', fontSize: 12 }}>{moment(item.created_at).format("DD/MM/YYYY HH:mm")}</Text>
                    </View>
                    <Chip
                        textStyle={{ color: 'white', fontSize: 11 }}
                        style={{ backgroundColor: getStatusColor(item.status), height: 30 }}
                    >
                        {item.status}
                    </Chip>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                    <Text>Mã GD: PQ{item.id || '---'}</Text>
                    <Text style={{ fontWeight: 'bold', color: '#a50064' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator color="#2563eb" /></View>;

    console.log(history)
    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>Chưa có giao dịch nào.</Text>}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { marginBottom: 10, backgroundColor: 'white' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});

export default PaymentHistory;