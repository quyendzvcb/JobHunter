import React from "react";
import { View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MyStyles from "../styles/MyStyles";

const Welcome = () => {
    const nav = useNavigation();

    return (
        <View style={[MyStyles.container, MyStyles.center, {backgroundColor: 'white', padding: 30}]}>
            <Image 
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/2936/2936886.png" }} 
                style={{ width: 250, height: 250, marginBottom: 30 }} 
                resizeMode="contain"
            />
            <Text style={MyStyles.headerTitle}>JOB HUNTER</Text>
            <Text style={MyStyles.subTitle}>Tìm kiếm việc làm mơ ước & Kết nối nhà tuyển dụng hàng đầu.</Text>
            
            <Button 
                mode="contained" 
                style={[MyStyles.btnPrimary, { width: '100%' }]} 
                contentStyle={{ height: 50 }}
                onPress={() => nav.replace("MainApp")} // Dùng replace để không quay lại được welcome
            >
                KHÁM PHÁ ỨNG DỤNG
            </Button>
        </View>
    );
}

export default Welcome;