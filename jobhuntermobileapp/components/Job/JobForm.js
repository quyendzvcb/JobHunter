import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Switch, Portal, Modal, RadioButton, List, Divider, ActivityIndicator } from 'react-native-paper';
import Apis, { endpoints } from '../../utils/Apis';

const JobForm = ({ initialValues, onSubmit, loading, buttonLabel }) => {
    const [job, setJob] = useState({
        title: '',
        salary_min: '',
        salary_max: '',
        location_id: null,
        category_id: null,
        deadline: '',
        description: '',
        requirements: '',
        is_active: true,
        quantity: '1',
    });

    // State cho dữ liệu API
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]); // Giả sử có API location

    // State cho Modal chọn
    const [visibleCat, setVisibleCat] = useState(false);
    const [visibleLoc, setVisibleLoc] = useState(false);

    // Load dữ liệu ban đầu và Gọi API Danh mục
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Categories
                const res = await Apis.get(endpoints['categories']);
                setCategories(res.data);

                // 2. Load Locations (Nếu có API thì mở comment này ra)
                // const resLoc = await Apis.get(endpoints['districts']);
                // setLocations(resLoc.data);

                // DATA MẪU CHO LOCATION (Xóa nếu có API thật)
                setLocations([
                    { id: 1, name: "Hồ Chí Minh" },
                    { id: 2, name: "Hà Nội" },
                    { id: 3, name: "Đà Nẵng" }
                ]);

            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };

        loadData();

        if (initialValues) {
            setJob({
                ...initialValues,
                salary_min: initialValues.salary_min?.toString() || '',
                salary_max: initialValues.salary_max?.toString() || '',
                quantity: initialValues.quantity?.toString() || '1',
                category_id: initialValues.category?.id || initialValues.category_id, // Xử lý tùy data trả về
                location_id: initialValues.location?.id || initialValues.location_id,
            });
        }
    }, [initialValues]);

    const handleChange = (field, value) => {
        setJob(prev => ({ ...prev, [field]: value }));
    };

    const validateAndSubmit = () => {
        if (!job.title || !job.description || !job.category_id) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề, mô tả và chọn danh mục.");
            return;
        }
        onSubmit(job);
    };

    // Hàm lấy tên để hiển thị ra Input
    const getSelectedLabel = (list, id) => {
        const item = list.find(i => i.id === id);
        return item ? item.name : '';
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={styles.headerTitle}>{buttonLabel}</Text>

            <TextInput
                label="Tiêu đề công việc *"
                value={job.title}
                onChangeText={(t) => handleChange('title', t)}
                mode="outlined"
                style={styles.input}
            />

            {/* --- CHỌN DANH MỤC (Dropdown Modal) --- */}
            <TouchableOpacity onPress={() => setVisibleCat(true)}>
                <TextInput
                    label="Danh mục ngành nghề *"
                    value={getSelectedLabel(categories, job.category_id)}
                    mode="outlined"
                    style={styles.input}
                    editable={false} // Không cho nhập tay
                    right={<TextInput.Icon icon="chevron-down" />}
                />
            </TouchableOpacity>

            {/* --- CHỌN ĐỊA ĐIỂM (Dropdown Modal) --- */}
            <TouchableOpacity onPress={() => setVisibleLoc(true)}>
                <TextInput
                    label="Địa điểm làm việc"
                    value={getSelectedLabel(locations, job.location_id)}
                    mode="outlined"
                    style={styles.input}
                    editable={false}
                    right={<TextInput.Icon icon="map-marker" />}
                />
            </TouchableOpacity>

            <View style={styles.row}>
                <TextInput
                    label="Lương tối thiểu"
                    value={job.salary_min}
                    onChangeText={(t) => handleChange('salary_min', t)}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                />
                <TextInput
                    label="Lương tối đa"
                    value={job.salary_max}
                    onChangeText={(t) => handleChange('salary_max', t)}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                />
            </View>

            <TextInput
                label="Hạn nộp (YYYY-MM-DD)"
                value={job.deadline}
                onChangeText={(t) => handleChange('deadline', t)}
                mode="outlined"
                placeholder="2024-12-31"
                right={<TextInput.Icon icon="calendar" />}
                style={styles.input}
            />

            <TextInput
                label="Số lượng tuyển"
                value={job.quantity}
                onChangeText={(t) => handleChange('quantity', t)}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
            />

            <TextInput
                label="Mô tả công việc *"
                value={job.description}
                onChangeText={(t) => handleChange('description', t)}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={styles.input}
            />

            <TextInput
                label="Yêu cầu ứng viên"
                value={job.requirements}
                onChangeText={(t) => handleChange('requirements', t)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
            />

            <View style={styles.switchRow}>
                <Text style={{ fontSize: 16 }}>Hiển thị tin tuyển dụng:</Text>
                <Switch
                    value={job.is_active}
                    onValueChange={(v) => handleChange('is_active', v)}
                    color="#1976D2"
                />
            </View>

            <Button
                mode="contained"
                onPress={validateAndSubmit}
                loading={loading}
                disabled={loading}
                style={styles.btnSubmit}
                contentStyle={{ paddingVertical: 8 }}
            >
                {buttonLabel.toUpperCase()}
            </Button>

            {/* --- PORTAL MODAL DANH MỤC --- */}
            <Portal>
                <Modal visible={visibleCat} onDismiss={() => setVisibleCat(false)} contentContainerStyle={styles.modalContent}>
                    <Text style={styles.modalTitle}>Chọn Danh Mục</Text>
                    <ScrollView style={{ maxHeight: 400 }}>
                        <RadioButton.Group onValueChange={val => { handleChange('category_id', val); setVisibleCat(false); }} value={job.category_id}>
                            {categories.map(c => (
                                <View key={c.id}>
                                    <RadioButton.Item label={c.name} value={c.id} color="#1976D2" />
                                    <Divider />
                                </View>
                            ))}
                        </RadioButton.Group>
                    </ScrollView>
                    <Button onPress={() => setVisibleCat(false)} style={{ marginTop: 10 }}>Đóng</Button>
                </Modal>
            </Portal>

            {/* --- PORTAL MODAL ĐỊA ĐIỂM --- */}
            <Portal>
                <Modal visible={visibleLoc} onDismiss={() => setVisibleLoc(false)} contentContainerStyle={styles.modalContent}>
                    <Text style={styles.modalTitle}>Chọn Địa Điểm</Text>
                    <ScrollView style={{ maxHeight: 400 }}>
                        <RadioButton.Group onValueChange={val => { handleChange('location_id', val); setVisibleLoc(false); }} value={job.location_id}>
                            {locations.map(l => (
                                <View key={l.id}>
                                    <RadioButton.Item label={l.name} value={l.id} color="#1976D2" />
                                    <Divider />
                                </View>
                            ))}
                        </RadioButton.Group>
                    </ScrollView>
                    <Button onPress={() => setVisibleLoc(false)} style={{ marginTop: 10 }}>Đóng</Button>
                </Modal>
            </Portal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: 'white', flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1976D2', textAlign: 'center' },
    input: { marginBottom: 12, backgroundColor: 'white' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInput: { width: '48%' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 },
    btnSubmit: { marginTop: 20, backgroundColor: '#1976D2' },

    // Style cho Modal
    modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#1976D2' }
});

export default JobForm;