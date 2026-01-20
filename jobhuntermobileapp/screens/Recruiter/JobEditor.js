import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import JobForm from '../../components/Job/JobForm';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JobEditor = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadJob = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints['recruiter-job-detail'](jobId));
                setJob(res.data)
            } catch (ex) {
                console.log(ex);
                Alert.alert("Lỗi", "Không thể tải thông tin công việc.");
                navigation.goBack();
            }
        };
        loadJob();
    }, [jobId]);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            await authApis(token).delete(endpoints['recruiter-job-detail'](jobId));

            Alert.alert("Thành công", "Đã xóa tin tuyển dụng!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.log(err);
            Alert.alert("Lỗi", "Không thể xóa tin tuyển dụng này.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", onPress: handleDelete, style: "destructive" }
            ]
        );
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <IconButton
                    icon="delete"
                    iconColor="red"
                    size={24}
                    onPress={confirmDelete}
                />
            ),
        });
    }, [navigation]);

    const handleUpdate = async (updatedData) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            await authApis(token).patch(endpoints['recruiter-job-detail'](jobId), updatedData);

            Alert.alert("Thành công", "Cập nhật tin thành công!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.log(err);
            Alert.alert("Lỗi", "Không thể cập nhật tin.");
        } finally {
            setLoading(false);
        }
    };

    if (!job) return null;

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <JobForm
                    initialValues={job}
                    onSubmit={handleUpdate}
                    loading={loading}
                    buttonLabel="Lưu thay đổi"
                />
            </View>
            <View style={styles.toolbar}>
                <Button
                    mode="contained-tonal"
                    buttonColor="#FFEBEE"
                    textColor="#D32F2F"
                    icon="delete"
                    onPress={confirmDelete}
                    loading={loading}
                >
                    Xóa tin tuyển dụng này
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
        zIndex: 1,
    }
});

export default JobEditor;