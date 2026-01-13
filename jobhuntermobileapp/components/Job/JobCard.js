import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, Chip, Icon, IconButton, Button } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/vi';
import styles from './Styles';
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

    const handlePromote = () => {
        navigation.navigate("PackageList", { jobId: job.id });
    };

    return (
        <Card
            style={[styles.card, isPremium && styles.premiumCard]}
            onPress={handlePress}
            mode="elevated"
        >
            {isPremium && (
                <View style={styles.hotBadge}>
                    <Text style={styles.hotText}>HOT</Text>
                </View>
            )}

            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: logoUrl }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.contentContainer}>

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

                    <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                            <Icon source="cash" size={14} color="#2e7d32" />
                            <Text style={styles.salaryText}>
                                {job.salary ? job.salary : "Thỏa thuận"}
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

export default JobCard;