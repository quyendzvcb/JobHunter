import React from "react";
import { View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import WelcomeStyle from "./WelcomeStyle"; // Import style riêng

const Welcome = () => {
    const nav = useNavigation();

    return (
        <View style={WelcomeStyle.container}>
            <View style={WelcomeStyle.content}>
                <Image
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/2936/2936886.png" }}
                    style={WelcomeStyle.image}
                    resizeMode="contain"
                />

                <Text style={WelcomeStyle.title}>JOB HUNTER</Text>

                <Text style={WelcomeStyle.subtitle}>
                    Tìm kiếm việc làm mơ ước &{"\n"}Kết nối nhà tuyển dụng hàng đầu.
                </Text>

                <Button
                    mode="contained"
                    style={WelcomeStyle.button}
                    contentStyle={WelcomeStyle.buttonContent}
                    labelStyle={WelcomeStyle.buttonLabel}
                    onPress={() => nav.replace("Login")} // Chuyển sang Login thay vì MainApp để đúng luồng
                >
                    BẮT ĐẦU NGAY
                </Button>
            </View>
        </View>
    );
}

export default Welcome;