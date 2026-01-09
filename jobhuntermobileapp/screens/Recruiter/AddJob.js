import React, { useState } from 'react';
import { Alert } from 'react-native';
import JobForm from '../../components/Job/JobForm'; // Đường dẫn import tùy folder
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddJob = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const handleCreate = async (jobData) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).post(endpoints['recruiter-jobs'], jobData);

            Alert.alert("Thành công", "Đăng tin tuyển dụng thành công!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <JobForm
            onSubmit={handleCreate}
            loading={loading}
            buttonLabel="Đăng tin tuyển dụng"
        />
    );
};

export default AddJob;