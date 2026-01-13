import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Portal, Modal, Checkbox, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Apis, { endpoints } from '../../utils/Apis';
import UnifiedTextInput from '../../components/Common/UnifiedTextInput';


const JobForm = ({ initialValues, onSubmit, loading, buttonLabel }) => {
    // 1. State chỉ giữ những gì cần thiết cho logic giao diện
    const [job, setJob] = useState({
        title: '', salary_min: '', salary_max: '',
        location_ids: [], category_id: null, deadline: '',
        description: '', benefits: '', requirements: '',
    });

    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [visibleCat, setVisibleCat] = useState(false);
    const [visibleLoc, setVisibleLoc] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);


    // 2. Tải metadata (Chỉ chạy 1 lần duy nhất)
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                const resCat = await Apis.get(endpoints['categories']);
                const resLoc = await Apis.get(endpoints['locations']);
                setCategories(resCat.data);
                setLocations(resLoc.data);
            } catch (err) {
                console.error("Lỗi tải metadata:", err);
            } finally {
                setFetchingData(false);
            }
        };
        loadMetadata();
    }, []);

    // 3. Nạp dữ liệu cũ (Chế độ Edit)
    useEffect(() => {
        if (initialValues) {
            setJob({
                title: initialValues.title || '',
                salary_min: initialValues.salary_min?.toString() || '',
                salary_max: initialValues.salary_max?.toString() || '',
                location_ids: initialValues.location_details
                    ? initialValues.location_details.map(l => l.id)
                    : (initialValues.location || []), // Map từ 'location' của backend nếu có
                category_id: initialValues.category_detail?.id || initialValues.category,
                deadline: initialValues.deadline || '',
                description: initialValues.description || '',
                benefits: initialValues.benefits || '',
                requirements: initialValues.requirements || '',
            });
        }
    }, [initialValues]);

    const handleChange = (field, value) => {
        setJob(prev => ({ ...prev, [field]: value }));
    };

    const toggleLocation = (id) => {
        setJob(prev => {
            const newIds = prev.location_ids.includes(id)
                ? prev.location_ids.filter(item => item !== id)
                : [...prev.location_ids, id];
            return { ...prev, location_ids: newIds };
        });
    };

    const getSelectedLabel = (list, selectedId, isMultiple = false) => {
        if (isMultiple) {
            return list.filter(i => selectedId.includes(i.id)).map(i => i.city).join(", ");
        }
        const item = list.find(i => i.id === selectedId);
        return item ? (item.name || item.city) : '';
    };

    // 4. FIX LỖI 400: Map dữ liệu đúng tên trường Backend yêu cầu
    const validateAndSubmit = () => {
        if (!job.title || !job.description || !job.category_id || job.location_ids.length === 0) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập các trường có dấu (*)");
            return;
        }

        // Tạo object mới để gửi đi với các key mà Backend mong muốn (theo ảnh screenshot)
        const dataToSubmit = {
            title: job.title,
            description: job.description,
            benefits: job.benefits,
            requirements: job.requirements,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            deadline: job.deadline,
            category: job.category_id, // Map từ category_id -> category
            location: job.location_ids  // Map từ location_ids -> location
        };

        onSubmit(dataToSubmit);
    };

    if (fetchingData) {
        return <View style={styles.center}><ActivityIndicator color="#1976D2" /></View>;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.headerTitle}>
                {initialValues ? "CẬP NHẬT TIN TUYỂN DỤNG" : "ĐĂNG TIN TUYỂN DỤNG MỚI"}
            </Text>

            <UnifiedTextInput
                label="Tiêu đề công việc *"
                value={job.title}
                onChangeText={(t) => handleChange('title', t)}
                wrapperStyle={styles.input}
            />

            <UnifiedTextInput
                label="Ngành nghề *"
                value={getSelectedLabel(categories, job.category_id)}
                rightIcon={<TextInput.Icon icon="chevron-down" />}
                onPress={() => setVisibleCat(true)}  // ← Dòng quan trọng
                wrapperStyle={styles.input}
            />

            <UnifiedTextInput
                label="Địa điểm làm việc (Chọn nhiều) *"
                value={getSelectedLabel(locations, job.location_ids, true)}
                rightIcon={<TextInput.Icon icon="chevron-down" />}
                multiline={job.location_ids.length > 1}
                onPress={() => setVisibleLoc(true)}  // ← Dòng quan trọng
                wrapperStyle={styles.input}
            />
            <View style={styles.row}>
                <UnifiedTextInput
                    label="Lương tối thiểu"
                    value={job.salary_min}
                    onChangeText={(t) => handleChange('salary_min', t)}
                    keyboardType="numeric"
                    wrapperStyle={[styles.input, styles.halfInput]}
                />
                <UnifiedTextInput
                    label="Lương tối đa"
                    value={job.salary_max}
                    onChangeText={(t) => handleChange('salary_max', t)}
                    keyboardType="numeric"
                    wrapperStyle={[styles.input, styles.halfInput]}
                />
            </View>

            <UnifiedTextInput
                label="Hạn nộp (YYYY-MM-DD) *"
                value={job.deadline}
                onChangeText={(t) => handleChange('deadline', t)}
                icon="calendar"
                placeholder="YYYY-MM-DD"
                wrapperStyle={styles.input}
            />

            <UnifiedTextInput
                label="Mô tả công việc *"
                value={job.description}
                onChangeText={(t) => handleChange('description', t)}
                multiline={true}
                numberOfLines={4}
                wrapperStyle={styles.input}
            />

            <UnifiedTextInput
                label="Quyền lợi ứng viên *"
                value={job.benefits}
                onChangeText={(t) => handleChange('benefits', t)}
                multiline={true}
                numberOfLines={3}
                wrapperStyle={styles.input}
            />

            <UnifiedTextInput
                label="Yêu cầu công việc *"
                value={job.requirements}
                onChangeText={(t) => handleChange('requirements', t)}
                multiline={true}
                numberOfLines={3}
                wrapperStyle={styles.input}
            />

            <Button
                mode="contained"
                onPress={validateAndSubmit}
                loading={loading}
                disabled={loading}
                style={styles.btnSubmit}
                contentStyle={{ paddingVertical: 8 }}
            >
                {buttonLabel || (initialValues ? "Cập nhật" : "Đăng tin")}
            </Button>

            <Portal>
                <Modal visible={visibleCat} onDismiss={() => setVisibleCat(false)} contentContainerStyle={styles.modalContent}>
                    <Text style={styles.modalTitle}>Chọn Ngành Nghề</Text>
                    <ScrollView style={{ maxHeight: 350 }}>
                        {categories.map(c => (
                            <TouchableOpacity key={c.id} onPress={() => { handleChange('category_id', c.id); setVisibleCat(false); }}>
                                <View style={styles.checkItem}>
                                    <Text style={job.category_id === c.id ? styles.selectedText : null}>{c.name}</Text>
                                    {job.category_id === c.id && <MaterialCommunityIcons name="check" size={20} color="#1976D2" />}
                                </View>
                                <Divider />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Modal>

                <Modal visible={visibleLoc} onDismiss={() => setVisibleLoc(false)} contentContainerStyle={styles.modalContent}>
                    <Text style={styles.modalTitle}>Chọn Địa Điểm (Có thể chọn nhiều)</Text>
                    <ScrollView style={{ maxHeight: 350 }}>
                        {locations.map(l => (
                            <TouchableOpacity key={l.id} onPress={() => toggleLocation(l.id)}>
                                <View style={styles.checkItem}>
                                    <Text style={job.location_ids.includes(l.id) ? styles.selectedText : null}>{l.city}</Text>
                                    <Checkbox
                                        status={job.location_ids.includes(l.id) ? 'checked' : 'unchecked'}
                                        color="#1976D2"
                                        onPress={() => toggleLocation(l.id)}
                                    />
                                </View>
                                <Divider />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Button mode="contained" onPress={() => setVisibleLoc(false)} style={{ marginTop: 15 }}>Xong</Button>
                </Modal>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#fff', flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1976D2', textAlign: 'center' },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInput: { width: '48%' },
    btnSubmit: { backgroundColor: '#1976D2', borderRadius: 8, marginTop: 10 },
    modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1976D2' },
    checkItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    selectedText: { color: '#1976D2', fontWeight: 'bold' }
});

export default JobForm;