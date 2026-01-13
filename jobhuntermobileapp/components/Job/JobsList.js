import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Searchbar, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Apis, { authApis, endpoints } from '../../utils/Apis';
import JobCard from './JobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from "@react-navigation/native";

const JobsList = ({
    navigation,
    filters,
    setFilters,
    onOpenFilter,
    isRecruiter = false,
    headerComponent = null,
    onRefreshExternal
}) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Chặn gọi API 2 lần khi mới vào
    const isFocused = useIsFocused();
    const firstRender = useRef(true);

    // Effect 1: Focus lại màn hình
    useEffect(() => {
        if (isFocused) {
            if (firstRender.current) {
                firstRender.current = false;
                return;
            }
            loadJobs(1);
        }
    }, [isFocused]);

    // Effect 2: Thay đổi bộ lọc
    useEffect(() => {
        if (!isRecruiter) {
            setPage(1);
            loadJobs(1);
        }
    }, [isRecruiter ? null : JSON.stringify(filters)]);

    // Effect 3: Tìm kiếm
    useEffect(() => {
        let timer = setTimeout(() => {
            if (page > 0) {
                setPage(1);
                loadJobs(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    // --- HÀM GỌI API ---
    const loadJobs = async (pageNum = 1) => {
        if (pageNum === 0) return;

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const api = isRecruiter ? authApis(token) : Apis;

            let url = isRecruiter
                ? `${endpoints['recruiter-jobs']}?page=${pageNum}`
                : `${endpoints.jobs()}?page=${pageNum}`;

            if (searchText) url += `&q=${searchText}`;

            if (filters) {
                if (filters.ordering) url += `&ordering=${filters.ordering}`;
                if (!isRecruiter) {
                    if (filters.category_id) url += `&category_id=${filters.category_id}`;
                    if (filters.salary_min) url += `&salary_min=${filters.salary_min}`;

                    // Gửi mảng location_id lên Backend (Backend dùng params.getlist để nhận)
                    if (filters.location_id && Array.isArray(filters.location_id)) {
                        filters.location_id.forEach(id => {
                            url += `&location_id=${id}`;
                        });
                    }
                }
            }

            console.log("Calling API:", url);
            const res = await api.get(url);

            // --- CẬP NHẬT STATE (Không cần lọc trùng nữa vì Backend đã lo) ---
            if (pageNum === 1) {
                setJobs(res.data.results);
            } else {
                setJobs(prev => [...prev, ...res.data.results]);
            }

            if (res.data.next === null) {
                setPage(0);
            } else {
                setPage(pageNum);
            }

        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                setPage(0);
            } else {
                console.error("Load Jobs Error:", ex);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (onRefreshExternal) {
            await onRefreshExternal();
        }
        setPage(1);
        await loadJobs(1);
    };

    const loadMore = () => {
        if (!loading && page > 0) {
            const nextPage = page + 1;
            loadJobs(nextPage);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder={isRecruiter ? "Tìm trong tin của bạn..." : "Tìm việc, công ty..."}
                    onChangeText={setSearchText}
                    value={searchText}
                    style={styles.searchBar}
                    elevation={0}
                />

                {!isRecruiter && (
                    <View style={styles.toolsRow}>
                        <Button mode="outlined" icon="filter-variant" onPress={onOpenFilter} style={styles.toolBtn}>
                            Bộ lọc
                        </Button>
                        <TouchableOpacity
                            style={styles.sortBtn}
                            onPress={() => setFilters && setFilters({ ...filters, ordering: filters.ordering === 'salary' ? '-created_at' : 'salary' })}
                        >
                            <MaterialCommunityIcons name={filters?.ordering === 'salary' ? "cash" : "clock-outline"} size={20} color="#666" />
                            <Text style={{ marginLeft: 5 }}>{filters?.ordering === 'salary' ? "Lương cao" : "Mới nhất"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={headerComponent}
                renderItem={({ item }) => (
                    <JobCard
                        job={item}
                        navigation={navigation}
                        isEditable={isRecruiter}
                        onEditPress={(job) => navigation.navigate("JobEditor", { jobId: job.id })}
                    />
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListFooterComponent={loading && page > 1 ? <ActivityIndicator size="small" color="#1976D2" style={{ margin: 20 }} /> : null}
                ListEmptyComponent={!loading && <Text style={styles.emptyText}>Không tìm thấy tin nào.</Text>}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {loading && page === 1 && !refreshing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#1976D2" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', marginTop: 30 },
    header: { padding: 10, backgroundColor: 'white', elevation: 2 },
    searchBar: { backgroundColor: '#f0f0f0', borderRadius: 10 },
    toolsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    toolBtn: { borderColor: '#ddd', borderRadius: 20 },
    sortBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
    loadingOverlay: {
        position: 'absolute', top: 150, left: 0, right: 0, bottom: 0,
        justifyContent: 'flex-start', alignItems: 'center', zIndex: 999
    }
});

export default JobsList;