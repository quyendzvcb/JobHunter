import React, { useContext } from "react";
import { View, ScrollView, Alert, Image } from "react-native";
import { Avatar, Text, Button, Chip, List, Divider } from "react-native-paper";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { useNavigation } from "@react-navigation/native";
import MyStyles from "../../styles/MyStyles";

const Profile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigation();

    const logout = () => {
        Alert.alert("Đăng xuất", "Bạn muốn đăng xuất?", [
            { text: "Hủy" },
            { text: "Đồng ý", onPress: () => dispatch({ type: "logout" }) }
        ]);
    };

    if (!user) {
        return (
            <View style={[MyStyles.container, MyStyles.center, { padding: 30 }]}>
                <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" }} style={{ width: 120, height: 120, opacity: 0.5, marginBottom: 20 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Bạn chưa đăng nhập</Text>
                <View style={{ width: '100%' }}>
                    <Button mode="contained" style={MyStyles.btnPrimary} onPress={() => nav.navigate("Login")}>ĐĂNG NHẬP</Button>
                    <Button mode="outlined" style={MyStyles.btnOutline} textColor="#d32f2f" onPress={() => nav.navigate("Register")}>ĐĂNG KÝ</Button>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={MyStyles.container}>
            <View style={{ backgroundColor: 'white', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' }}>
                <Avatar.Image size={100} source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 10 }}>{user.last_name} {user.first_name}</Text>
                <Text style={{ color: 'gray' }}>@{user.username}</Text>
                <Chip style={{ marginTop: 10, backgroundColor: user.role === 'RECRUITER' ? '#e3f2fd' : '#e8f5e9' }}>
                    {user.role === 'RECRUITER' ? 'Nhà Tuyển Dụng' : 'Ứng Viên'}
                </Chip>
            </View>

            <List.Section style={{ backgroundColor: 'white', marginTop: 15 }}>
                <List.Subheader>Cài đặt chung</List.Subheader>
                <List.Item title="Chỉnh sửa thông tin" left={props => <List.Icon {...props} icon="account-edit" />} onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")} />
                <Divider />
                <List.Item title="Đổi mật khẩu" left={props => <List.Icon {...props} icon="lock-reset" />} />
                <Divider />
                <List.Item title="Trợ giúp & Phản hồi" left={props => <List.Icon {...props} icon="help-circle-outline" />} />
            </List.Section>

            {/* Chỉ hiện nút xem nhanh Activity nếu muốn dẫn người dùng sang tab kia */}
            <View style={{ padding: 15 }}>
                <Button mode="outlined" style={MyStyles.btnOutline} textColor="#d32f2f" onPress={() => nav.navigate("Activity")}>
                    {user.role === 'RECRUITER' ? 'QUẢN LÝ ỨNG VIÊN' : 'XEM LỊCH SỬ ỨNG TUYỂN'}
                </Button>
                <Button mode="contained" onPress={logout} style={{ backgroundColor: '#555', marginTop: 10 }}>ĐĂNG XUẤT</Button>
            </View>
        </ScrollView>
    );
}
export default Profile;