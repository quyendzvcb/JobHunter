import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, useWindowDimensions, Image, Alert } from "react-native";
import { Text, Button } from "react-native-paper";
import RenderHtml from 'react-native-render-html';
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import MyStyles from "../../styles/MyStyles";

const JobDetail = ({ route }) => {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const { width } = useWindowDimensions();
    const [user] = useContext(MyUserContext);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await Apis.get(endpoints['job-details'](jobId));
                setJob(res.data);
            } catch (e) { console.error(e); }
        }
        load();
    }, [jobId]);

    const apply = async () => {
        if (!user) return Alert.alert("Thông báo", "Vui lòng đăng nhập để ứng tuyển!");
        try {
            let form = new FormData();
            form.append("job", jobId);
            await authApis(user.token).post(endpoints['apply-job'], form, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert("Thành công", "Đã ứng tuyển!");
        } catch (e) { Alert.alert("Lỗi", "Đã có lỗi xảy ra hoặc bạn đã ứng tuyển rồi."); }
    }

    if (!job) return <Text>Đang tải...</Text>;

    return (
        <ScrollView style={[MyStyles.container, { backgroundColor: 'white' }]}>
            <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#fff5f5' }}>
                <Image source={{ uri: job.recruiter.logo }} style={{ width: 80, height: 80 }} resizeMode="contain" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>{job.title}</Text>
                <Text style={{ color: 'gray' }}>{job.recruiter.company_name}</Text>
                <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18, marginTop: 5 }}>
                    {job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Thỏa thuận'}
                </Text>
            </View>

            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Mô tả công việc</Text>
                <RenderHtml contentWidth={width} source={{ html: job.description }} />

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 15 }}>Yêu cầu</Text>
                <RenderHtml contentWidth={width} source={{ html: job.requirements }} />

                <Button mode="contained" onPress={apply} style={[MyStyles.btnPrimary, { marginTop: 20 }]} contentStyle={{ height: 50 }}>
                    ỨNG TUYỂN NGAY
                </Button>
            </View>
        </ScrollView>
    );
}
export default JobDetail;