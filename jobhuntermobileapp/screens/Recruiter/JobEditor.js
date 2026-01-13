import React, { useState } from 'react';
import { Alert } from 'react-native';
import JobForm from '../../components/Job/JobForm';
import Apis, { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const JobEditor = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [job, setJob] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadJob = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints['recruiter-job-detail'](jobId));
                setJob(res.data)
                console.log(res.data);
            } catch (ex) {
                console.log(ex);
            }
        };
        loadJob();
    }, [])
    const handleUpdate = async (updatedData) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).patch(endpoints['recruiter-job-detail'](job.id), updatedData);

            Alert.alert("Thành công", "Cập nhật tin thành công!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể cập nhật tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <JobForm
            initialValues={job} // Truyền dữ liệu cũ vào form
            onSubmit={handleUpdate}
            loading={loading}
            buttonLabel="Lưu thay đổi"
        />
    );
};

export default JobEditor;