import React, { useState } from 'react';
import { Alert } from 'react-native';
import JobForm from '../../components/Job/JobForm';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddJob = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const handleCreateJob = async (formData) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).post(endpoints['recruiter-jobs'], formData);

            const newJobId = res.data.id;

            Alert.alert(
                "Đăng tin thành công!",
                "Bạn có muốn mua gói Đẩy tin (Premium) để tiếp cận nhiều ứng viên hơn không?",
                [
                    {
                        text: "Để sau",
                        onPress: () => navigation.goBack(),
                        style: "cancel"
                    },
                    {
                        text: "MUA NGAY",
                        onPress: () => navigation.navigate("PackageList", { jobId: newJobId })
                    }
                ]
            );

        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể đăng tin.");
        }
    }

    return (
        <JobForm
            onSubmit={handleCreateJob}
            loading={loading}
            buttonLabel="Đăng tin tuyển dụng"
        />
    );
};

export default AddJob;