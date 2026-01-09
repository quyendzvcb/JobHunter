import React, { useState } from 'react';
import { Alert } from 'react-native';
import JobForm from '../../components/Job/JobForm';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JobEditor = ({ route, navigation }) => {
    const { job } = route.params; // Lấy job từ màn hình trước truyền sang
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (updatedData) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            // Gọi API PATCH vào endpoint detail của job (thường là /jobs/{id}/)
            // Lưu ý: Endpoint này tùy thuộc vào backend của bạn định nghĩa
            const res = await authApis(token).patch(endpoints['job-detail'](job.id), updatedData);

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