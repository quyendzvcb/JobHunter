import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Chip, Icon, IconButton } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

const JobCard = ({ job, navigation }) => {

    const getLocationName = () => {
        if (job.location_details && job.location_details.length > 0) {
            return job.location_details.map(loc => loc.city).join(", ");
        }
        return "Toàn quốc";
    };

    const logoUrl = job.recruiter_detail.logo || "https://via.placeholder.com/100";

    const handlePress = () => {
        navigation.navigate("JobDetail", { jobId: job.id });
    };

    return (
        <Card style={styles.card} onPress={handlePress}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: logoUrl }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.contentContainer}>
                    <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
                        {job.title}
                    </Text>

                    <Text variant="bodySmall" style={styles.companyName} numberOfLines={1}>
                        {job.recruiter_detail.company_name || "Công ty ẩn danh"}
                    </Text>
                    <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                            <Icon source="cash" size={14} color="#2e7d32" />
                            <Text style={styles.salaryText}>
                                {job.salary}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                            <Icon source="map-marker" size={13} color="#5c6bc0" />
                            <Text style={styles.metaText} numberOfLines={1}>
                                {getLocationName()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <Text variant="labelSmall" style={styles.timeText}>
                            {moment(job.created_at, "DD-MM-YYYY HH:mm:ss").fromNow()}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 10,
        marginVertical: 6,
        backgroundColor: 'white',
        elevation: 2, // Đổ bóng cho Android
        borderRadius: 8,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        maxWidth: '100%',
    },
    metaText: {
        fontSize: 12,
        color: '#3f51b5',
        marginLeft: 4,
        flexShrink: 1,
    },
    container: {
        flexDirection: 'row',
        padding: 12,
    },
    logoContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#fff'
    },
    logo: {
        width: 50,
        height: 50,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    companyName: {
        color: '#757575',
        marginBottom: 6,
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    salaryText: {
        fontSize: 12,
        color: '#2e7d32', // Màu xanh lá cho lương
        fontWeight: '600',
        marginLeft: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        maxWidth: 100, // Giới hạn chiều dài địa điểm
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    timeText: {
        color: '#999',
    },
    actionContainer: {
        justifyContent: 'flex-start',
    }
});

export default JobCard;