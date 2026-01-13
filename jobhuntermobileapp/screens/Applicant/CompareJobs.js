import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import RenderHtml from 'react-native-render-html';
import Apis, { endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.40;
const LABEL_WIDTH = 95;

const HEIGHTS = {
    HEADER: 180,
    COMMON: 70,
    HTML: 160
};

const CompareJobs = ({ navigation, route }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            let ids = route.params?.jobIds || [];
            if (ids.length === 0) {
                Alert.alert("Thông báo", "Danh sách so sánh trống.");
                navigation.goBack();
                return;
            }
            const idsParam = ids.join(',');
            const res = await Apis.get(`${endpoints['job-compare']}?ids=${idsParam}`);
            setJobs(res.data);
        } catch (error) {
            console.log("Error:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu so sánh.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const removeJob = async (id) => {
        const newJobs = jobs.filter(j => j.id !== id);
        setJobs(newJobs);

        try {
            const newIds = newJobs.map(j => j.id);

            if (newIds.length > 0) {
                await AsyncStorage.setItem('compare_list', JSON.stringify(newIds));
            } else {
                await AsyncStorage.removeItem('compare_list');
                Alert.alert(
                    "Danh sách trống",
                    "Bạn đã xóa hết các công việc so sánh.",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật Storage:", error);
        }
    };
    const getRowColor = (index) => (index % 2 === 0 ? '#FFFFFF' : '#F8F9FA');

    const renderLabelColumn = () => (
        <View style={styles.labelColumnContainer}>
            {/* Header Cell */}
            <View style={[styles.cell, { height: HEIGHTS.HEADER, backgroundColor: '#F3F4F6', justifyContent: 'center' }]}>
                <Text style={[styles.labelText, { color: '#2962FF' }]}>TIÊU CHÍ</Text>
            </View>
            {/* Data Labels */}
            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(0) }]}>
                <Text style={styles.labelText}>Mức lương</Text>
            </View>
            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(1) }]}>
                <Text style={styles.labelText}>Địa điểm</Text>
            </View>
            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(2) }]}>
                <Text style={styles.labelText}>Kinh nghiệm</Text>
            </View>
            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(3) }]}>
                <Text style={styles.labelText}>Hạn nộp</Text>
            </View>
            <View style={[styles.cell, { height: HEIGHTS.HTML, backgroundColor: getRowColor(4) }]}>
                <Text style={styles.labelText}>Yêu cầu</Text>
            </View>
            <View style={[styles.cell, { height: HEIGHTS.HTML, backgroundColor: getRowColor(5), borderBottomWidth: 0 }]}>
                <Text style={styles.labelText}>Phúc lợi</Text>
            </View>
        </View>
    );

    // 2. Render Cột Dữ liệu (Cho 1 Job)
    const renderJobColumn = (job) => (
        <View key={job.id} style={{ width: COLUMN_WIDTH }}>
            <View style={[styles.cell, styles.jobHeaderCell, { height: HEIGHTS.HEADER }]}>
                <TouchableOpacity onPress={() => removeJob(job.id)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center', width: '100%', paddingHorizontal: 5 }}>
                    <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                    <Text style={styles.companyName} numberOfLines={1}>{job.recruiter_detail?.company_name}</Text>
                </View>
                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => navigation.navigate('JobDetail', { job_id: job.id })}
                >
                    <Text style={styles.applyBtnText}>Ứng tuyển</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(0) }]}>
                <Text style={[styles.text, styles.highlightText]}>{job.salary || "Thỏa thuận"}</Text>
            </View>

            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(1) }]}>
                <Text style={styles.text}>
                    {job.location_details?.map(l => l.city).join(', ') || "Toàn quốc"}
                </Text>
            </View>

            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(2) }]}>
                <Text style={styles.text}>{job.years_of_experience} năm</Text>
            </View>

            <View style={[styles.cell, { height: HEIGHTS.COMMON, backgroundColor: getRowColor(3) }]}>
                <Text style={styles.text}>{job.deadline}</Text>
            </View>

            <View style={[styles.cell, { height: HEIGHTS.HTML, backgroundColor: getRowColor(4) }]}>
                <View style={styles.htmlContainer}>
                    <RenderHtml
                        contentWidth={COLUMN_WIDTH - 30}
                        source={{ html: job.requirements || "<p>--</p>" }}
                        baseStyle={{ fontSize: 13, color: '#333' }}
                    />
                    <View style={styles.readMoreOverlay}><Text style={styles.readMoreText}>...</Text></View>
                </View>
            </View>

            <View style={[styles.cell, { height: HEIGHTS.HTML, backgroundColor: getRowColor(5), borderBottomWidth: 0 }]}>
                <View style={styles.htmlContainer}>
                    <RenderHtml
                        contentWidth={COLUMN_WIDTH - 30}
                        source={{ html: job.benefits || "<p>--</p>" }}
                        baseStyle={{ fontSize: 13, color: '#333' }}
                    />
                    <View style={styles.readMoreOverlay}><Text style={styles.readMoreText}>...</Text></View>
                </View>
            </View>
        </View>
    );

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2962FF" />
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={{ flexDirection: 'row' }}>

                    {renderLabelColumn()}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {jobs.map(job => renderJobColumn(job))}
                    </ScrollView>

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        marginTop: 35,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    body: {
        flex: 1,
    },

    labelColumnContainer: {
        width: LABEL_WIDTH,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },

    labelText: {
        fontWeight: '600',
        color: '#6B7280',
        fontSize: 12,
        textTransform: 'uppercase',
        textAlign: 'center',
    },

    cell: {
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    jobHeaderCell: {
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 2,
    },

    jobTitle: {
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
        color: '#1F2937',
        marginBottom: 4,
    },

    companyName: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 10,
        textAlign: 'center',
    },

    text: {
        fontSize: 13,
        color: '#374151',
        textAlign: 'center',
    },

    highlightText: {
        color: '#DC2626',
        fontWeight: '700',
        fontSize: 14,
    },

    removeBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        padding: 5,
        zIndex: 1,
        alignSelf: 'flex-end',
    },

    removeBtnText: {
        color: '#9CA3AF',
        fontSize: 20,
    },

    applyBtn: {
        backgroundColor: '#2962FF',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        width: '90%',
        alignItems: 'center',
    },

    applyBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },

    htmlContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },

    readMoreOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    readMoreText: {
        color: '#2962FF',
        fontSize: 10,
    },
});

export default CompareJobs;