import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, Chip, Icon, IconButton, Button } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

const JobCard = ({ job, navigation, isEditable = false, onEditPress }) => {

    const isPremium = job.is_premium;
    const viewCount = job.views || 0;

    const getLocationName = () => {
        if (job.location_details && job.location_details.length > 0) {
            return job.location_details.map(loc => loc.city).join(", ");
        }
        return "Toàn quốc";
    };

    const logoUrl = job.recruiter_detail?.logo || "https://via.placeholder.com/100";
    const companyName = job.recruiter_detail?.company_name || "Công ty ẩn danh";

    const handlePress = () => {
        if (isEditable && onEditPress) {
            onEditPress(job);
        } else {
            navigation.navigate("JobDetail", { job_id: job.id });
        }
    };

    // Hàm chuyển sang trang mua gói
    const handlePromote = () => {
        navigation.navigate("PackageList", { jobId: job.id });
    };

    return (
        <Card
            style={[styles.card, isPremium && styles.premiumCard]}
            onPress={handlePress}
            mode="elevated"
        >
            {/* Nhãn HOT cho tin Premium */}
            {isPremium && (
                <View style={styles.hotBadge}>
                    <Text style={styles.hotText}>HOT</Text>
                </View>
            )}

            <View style={styles.container}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: logoUrl }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Nội dung chính */}
                <View style={styles.contentContainer}>

                    {/* Header: Tiêu đề + Nút Sửa */}
                    <View style={styles.headerRow}>
                        <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
                            {job.title}
                        </Text>

                        {isEditable && (
                            <IconButton
                                icon="pencil-outline"
                                size={20}
                                iconColor="#1976D2"
                                style={styles.editBtn}
                                onPress={() => onEditPress(job)}
                            />
                        )}
                    </View>

                    {/* Dòng 2: Tên công ty hoặc Trạng thái */}
                    {!isEditable ? (
                        <Text variant="bodySmall" style={styles.companyName} numberOfLines={1}>
                            {companyName}
                        </Text>
                    ) : (
                        <View style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip
                                style={[styles.statusChip, { backgroundColor: job.is_active ? '#E8F5E9' : '#FFEBEE' }]}
                                textStyle={{ fontSize: 10, lineHeight: 12, color: job.is_active ? '#2E7D32' : '#C62828' }}
                            >
                                {job.is_active ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                            </Chip>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                marginLeft: 10, backgroundColor: '#f5f5f5',
                                paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12
                            }}>
                                <Icon source="eye" size={14} color="#666" />
                                <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: 'bold', color: '#666' }}>
                                    {viewCount}
                                </Text>
                            </View>

                            {!isPremium && (
                                <Button
                                    mode="outlined"
                                    textColor="#1976D2"
                                    style={styles.promoteButton}
                                    labelStyle={styles.promoteButtonLabel}
                                    contentStyle={styles.promoteButtonContent}
                                    icon="arrow-up-bold-circle-outline"
                                    onPress={handlePromote}
                                >
                                    Đẩy Top
                                </Button>
                            )}
                        </View>
                    )}

                    {/* Dòng 3: Mức lương */}
                    <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                            <Icon source="cash" size={14} color="#2e7d32" />
                            <Text style={styles.salaryText}>
                                {job.salary ? job.salary : "Thỏa thuận"}
                            </Text>
                        </View>
                    </View>

                    {/* Dòng 4: Địa điểm */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                            <Icon source="map-marker" size={13} color="#5c6bc0" />
                            <Text style={styles.metaText} numberOfLines={1}>
                                {getLocationName()}
                            </Text>
                        </View>
                    </View>

                    {/* Footer: Thời gian */}
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
        borderRadius: 8,
        overflow: 'hidden',
    },

    premiumCard: {
        borderWidth: 1.5,
        borderColor: '#FFD700',
        backgroundColor: '#FFFDF0',
    },
    // Nhãn HOT góc phải
    hotBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF0000',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderBottomLeftRadius: 8,
        zIndex: 10,
    },
    hotText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
        flex: 1,
        marginRight: 4,
    },
    editBtn: {
        margin: 0,
        marginTop: 2,
        marginRight: -10,
    },
    companyName: {
        color: '#757575',
        marginBottom: 6,
    },
    statusChip: {
        height: 24,
        alignItems: 'center',
        justifyContent: 'center'
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
        color: '#2e7d32',
        fontWeight: '600',
        marginLeft: 4,
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
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        marginTop: 2
    },
    timeText: {
        color: '#999',
    },
    promoteButton: {
        borderColor: '#1976D2',
        borderRadius: 20,
        borderWidth: 1,
    },
    promoteButtonLabel: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    promoteButtonContent: {
        height: 36,
    },
});

export default JobCard;