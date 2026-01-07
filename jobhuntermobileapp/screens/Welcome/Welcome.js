import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './WelcomeStyle';

const Welcome = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Header: Hình ảnh */}
            <View style={styles.headerContainer}>
                {/* Thay thế 'icon.png' bằng hình minh họa vector/illustration của bạn nếu có */}
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                />
                <View style={styles.bodyContainer}>
                    <Text style={styles.title}>Tìm việc làm mơ ước</Text>
                    <Text style={styles.subTitle}>
                        Khám phá hàng nghìn cơ hội nghề nghiệp phù hợp với kỹ năng của bạn ngay hôm nay.
                    </Text>
                </View>
            </View>

            {/* Body: Tiêu đề & Giới thiệu */}


            {/* Footer: Các nút hành động */}
            <View style={styles.footerContainer}>
                {/* Nút 1: Khám phá (Vào App chế độ Khách) */}
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.btnPrimaryText}>Khám phá ứng dụng</Text>
                </TouchableOpacity>

                {/* Nút 2: Đăng nhập */}
                <TouchableOpacity
                    style={[styles.btnSecondary, { backgroundColor: '#E3F2FD' }]} // Xanh nhạt
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={[styles.btnSecondaryText, { color: '#1976D2' }]}>Đăng nhập</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default Welcome;