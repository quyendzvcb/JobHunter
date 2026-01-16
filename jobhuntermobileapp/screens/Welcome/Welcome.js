import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './WelcomeStyle';

const Welcome = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
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



            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.btnPrimaryText}>Khám phá ứng dụng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btnSecondary, { backgroundColor: '#E3F2FD' }]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={[styles.btnSecondaryText, { color: '#1976D2' }]}>Đăng nhập</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default Welcome;