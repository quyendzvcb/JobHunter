import React, { useContext, useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Avatar, Surface, DataTable, FAB, Chip, Card } from "react-native-paper";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { authApis, endpoints } from "../../utils/Apis";
import JobsList from "../../components/Job/JobsList";
import styles from "./Styles";

const RecruiterHome = () => {
    const [user] = useContext(MyUserContext);
    const nav = useNavigation();
    const isFocused = useIsFocused();

    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const [year, setYear] = useState(currentYear);
    const [period, setPeriod] = useState('month');
    const [statsData, setStatsData] = useState([]);
    const [overview, setOverview] = useState({ totalViews: 0, totalApplies: 0, avgRating: 0 });

    const [filters, setFilters] = useState({ ordering: '-views' });

    const loadStats = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(`${endpoints['recruiter-jobs']}stats/?period=${period}&year=${year}`);
            const data = res.data.chart_data || [];
            setStatsData(data);

            if (data.length > 0) {
                const views = data.reduce((s, i) => s + (i.total_views || 0), 0);
                const applies = data.reduce((s, i) => s + (i.total_applies || 0), 0);
                const ratingItems = data.filter(i => i.avg_rating > 0);
                const avgRating = ratingItems.length ? (ratingItems.reduce((s, i) => s + i.avg_rating, 0) / ratingItems.length).toFixed(1) : 0;
                setOverview({ totalViews: views, totalApplies: applies, avgRating: avgRating });
            } else {
                setOverview({ totalViews: 0, totalApplies: 0, avgRating: 0 });
            }
        } catch (e) { console.error(e); }
    }, [year, period]);

    useEffect(() => {
        if (isFocused)
            loadStats();
    }, [isFocused, loadStats]);

    const renderStatsHeader = () => {
        const formatLabel = (d) => period === 'month' ? `T${new Date(d).getMonth() + 1}` : `Q${Math.floor(new Date(d).getMonth() / 3) + 1}`;

        return (
            <View>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.welcomeLabel}>Dashboard</Text>
                            <Text style={styles.userName}>{user.recruiter?.company_name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => nav.navigate('ProfileTab')}>
                            <Avatar.Image size={50} source={{ uri: user.recruiter?.logo }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard icon="file-document-outline" value={overview.totalApplies} label="Hồ sơ" color="#1976D2" />
                        <StatCard icon="eye-outline" value={overview.totalViews} label="Lượt xem" color="#E65100" />
                        <StatCard icon="star-outline" value={overview.avgRating} label="Chất lượng" color="#FBC02D" />
                    </View>
                </View>

                <View style={styles.bodyHeader}>
                    <Card style={styles.tableCard} elevation={1}>
                        <View style={styles.filterToolbar}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                                {yearsList.map(y => (
                                    <Chip key={y} mode={year === y ? 'flat' : 'outlined'} selected={year === y} onPress={() => setYear(y)} style={{ marginRight: 5, backgroundColor: year === y ? '#E3F2FD' : 'white' }}>{y}</Chip>
                                ))}
                            </ScrollView>
                            <TouchableOpacity onPress={() => setPeriod(period === 'month' ? 'quarter' : 'month')}>
                                <View>
                                    <Text style={{ color: '#1976D2', fontWeight: 'bold', margin: 23 }}>{period === 'month' ? 'Xem Tháng' : 'Xem Quý'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>Thời gian</DataTable.Title>
                                <DataTable.Title numeric>Hồ sơ</DataTable.Title>
                                <DataTable.Title numeric>Xem</DataTable.Title>
                                <DataTable.Title numeric>Điểm</DataTable.Title>
                            </DataTable.Header>
                            {statsData.map((item, idx) => (
                                <DataTable.Row key={idx}>
                                    <DataTable.Cell>{formatLabel(item.period_date)}</DataTable.Cell>
                                    <DataTable.Cell numeric>{item.total_applies}</DataTable.Cell>
                                    <DataTable.Cell numeric>{item.total_views}</DataTable.Cell>
                                    <DataTable.Cell numeric>{item.avg_rating ? item.avg_rating.toFixed(1) : '-'}</DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </Card>
                    <Text style={styles.sectionTitle}>Quản lý tin tuyển dụng</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <JobsList
                isRecruiter={true}
                navigation={nav}
                headerComponent={renderStatsHeader()}
                onRefreshExternal={loadStats}
                filters={filters}
                setFilters={setFilters}
            />

            <FAB icon="plus" label="Đăng tin" style={styles.fab} color="white" onPress={() => nav.navigate("AddJob")} />
        </View>
    );
};

const StatCard = ({ icon, value, label, color }) => (
    <Surface style={{ backgroundColor: 'white', width: '31%', padding: 10, borderRadius: 12, alignItems: 'center' }} elevation={2}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 5 }}>{value}</Text>
        <Text style={{ fontSize: 12, color: 'gray' }}>{label}</Text>
    </Surface>
);


export default RecruiterHome;