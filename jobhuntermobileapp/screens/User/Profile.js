import React, { useContext, useState } from "react";
import { View, ScrollView, Alert, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar, Text, Button, Chip, Card, Divider, ActivityIndicator, List } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import styles from "./ProfileStyle";

import { MyUserContext } from "../../utils/contexts/MyUserContext";
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
                    <Button mode="contasined" style={MyStyles.btnPrimary} onPress={() => nav.navigate("Login")}><Text style={{ color: 'white' }}>ĐĂNG NHẬP</Text></Button>
                    <Button mode="outlined" style={MyStyles.btnOutline} textColor="#1976D2" onPress={() => nav.navigate("Register")}>ĐĂNG KÝ</Button>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={MyStyles.container}>
            <View style={styles.headerCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.avatarWrapper}>
                        <Avatar.Image
                            size={70}
                            source={{ uri: user.avatar || user.recruiter?.logo || 'https://via.placeholder.com/150' }}
                            style={{ backgroundColor: '#e0e0e0' }}
                        />

                        {user?.applicant?.is_premium && (
                            <View style={styles.premiumCrownOverlay}>
                                <MaterialCommunityIcons name="crown" size={16} color="white" />
                            </View>
                        )}
                    </View>

                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.userName}>
                                {user.role === 'RECRUITER' ? user.recruiter?.company_name : `${user.last_name} ${user.first_name}`}
                            </Text>
                        </View>

                        <Text style={styles.userCode}>Username: @{user.username}</Text>

                        {user.role === 'APPLICANT' && (
                            !user?.applicant?.is_premium ? (
                                <TouchableOpacity
                                    style={styles.upgradeBtnSmall}
                                    onPress={() => nav.navigate('PackageList')}
                                >
                                    <MaterialCommunityIcons name="arrow-up-bold-circle" size={16} color="#4b5563" />
                                    <Text style={styles.upgradeText}>Nâng cấp tài khoản</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.premiumTag}>
                                    <Text style={{ color: '#b45309', fontWeight: 'bold', fontSize: 12 }}>Thành viên Premium</Text>
                                </View>
                            )
                        )}
                    </View>
                </View>
            </View>

            <View style={{ padding: 15 }}>
                <List.Item
                    title="Lịch sử thanh toán"
                    description="Xem lại các giao dịch đã thực hiện"
                    left={props => <List.Icon {...props} icon="history" color="#2563eb" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => nav.navigate('PaymentHistory')}
                    style={styles.menuItem}
                />

                <Divider style={{ marginVertical: 10 }} />

                <Button
                    mode="outlined"
                    style={MyStyles.btnOutline}
                    textColor="#1976D2"
                    onPress={() => nav.navigate("ActivityTab", { screen: 'ApplicationList' })}>
                    {user.role === 'RECRUITER' ? 'QUẢN LÝ ỨNG VIÊN' : 'XEM LỊCH SỬ ỨNG TUYỂN'}
                </Button>
                <Button mode="contained" onPress={logout} style={{ backgroundColor: '#555', marginTop: 10 }}>ĐĂNG XUẤT</Button>
            </View>
        </ScrollView>
    );
}

export default Profile;