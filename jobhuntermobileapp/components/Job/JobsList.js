import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Searchbar, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import APIs, { endpoints } from '../../utils/Apis';
import JobCard from '../Job/JobCard';

const JobsList = ({ navigation, filters, setFilters, onOpenFilter }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Hàm gọi API tìm kiếm
    // Quản lý số trang: bắt đầu từ 1, nếu bằng 0 nghĩa là đã hết dữ liệu (next = null)

    const loadJobs = async () => {
        if (page <= 0) return;
        try {
            setLoading(true);

            // Xây dựng URL với trang hiện tại
            // Đảm bảo endpoints.jobs() trả về "/jobs/"
            let url = `${endpoints.jobs()}?page=${page}`;

            if (searchText) {
                url = `${url}&q=${searchText}`;
            }

            if (filters.category_id) {
                url = `${url}&category_id=${filters.category_id}`;
            }

            if (filters.location_id && Array.isArray(filters.location_id)) {
                filters.location_id.forEach(id => {
                    url += `&location_id=${id}`;
                });
            }

            if (filters.salary_min) {
                url = `${url}&salary_min=${filters.salary_min}`;
            }

            if (filters.ordering) {
                url = `${url}&ordering=${filters.ordering}`;
            }

            console.info("Gọi API:", url);

            let res = await APIs.get(url);

            // LOGIC QUAN TRỌNG: Nếu Backend báo không còn trang tiếp theo (next === null)
            // Đặt page về 0 để hàm loadMore không thể tăng page lên nữa.
            if (res.data.next === null) {
                setPage(0);
            }

            if (page === 1) {
                // Trang đầu tiên: Thay thế hoàn toàn danh sách cũ.
                setJobs(res.data.results);
            } else if (page > 1) {
                // Các trang tiếp theo: Nối thêm dữ liệu mới vào cuối danh sách.
                setJobs([...jobs, ...res.data.results]);
            }

        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                console.log("Đã hết dữ liệu hoặc trang không tồn tại, dừng phân trang.");
                setPage(0);
            }
        } finally {
            setLoading(false);
        }
    }

    // Refresh: Kéo xuống làm mới
    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        setRefreshing(false);
    };

    // LoadMore: Kéo xuống đáy
    const loadMore = () => {
        if (!loading && page > 0 && jobs.length > 0) {
            setPage(page + 1);
        }
    };

    // Effect: Tự động gọi API khi filters hoặc searchText thay đổi (Debounce)
    useEffect(() => {
        let timer = setTimeout(() => {
            if (page > 0) {
                loadJobs();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [page]);

    useEffect(() => {
        setPage(1);
    }, [searchText, filters]);

    return (
        <View style={styles.container}>
            {/* Header: Tìm kiếm & Công cụ */}
            <View style={styles.header}>
                <Searchbar
                    placeholder="Tìm việc, công ty..."
                    onChangeText={setSearchText}
                    value={searchText}
                    style={styles.searchBar}
                    onSubmitEditing={() => loadJobs(1)}
                />
                <View style={styles.toolsRow}>
                    <Button
                        mode="outlined"
                        icon="filter-variant"
                        onPress={onOpenFilter} // Gọi hàm mở Modal từ Home
                        style={styles.toolBtn}
                    >
                        Bộ lọc
                    </Button>

                    <TouchableOpacity
                        style={styles.sortBtn}
                        // Cập nhật ordering thông qua setFilters được truyền từ Home
                        onPress={() => setFilters({
                            ...filters,
                            ordering: filters.ordering === 'salary' ? '-created_at' : 'salary'
                        })}
                    >
                        <MaterialCommunityIcons
                            name={filters.ordering === 'salary' ? "cash" : "clock-outline"}
                            size={20} color="#666"
                        />
                        <Text style={{ marginLeft: 5 }}>
                            {filters.ordering === 'salary' ? "Lương cao" : "Mới nhất"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Danh sách công việc */}
            <View style={{ flex: 1 }}>
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <JobCard job={item} navigation={navigation} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListFooterComponent={loading && !refreshing && <ActivityIndicator size="large" color="#0000ff" />}
                    ListEmptyComponent={!loading && <Text style={styles.emptyText}>Không tìm thấy công việc nào.</Text>}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 10, backgroundColor: 'white', elevation: 2 },
    searchBar: { marginBottom: 10, elevation: 0, backgroundColor: '#f0f0f0' },
    toolsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    toolBtn: { borderColor: '#ddd' },
    sortBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});

export default JobsList;