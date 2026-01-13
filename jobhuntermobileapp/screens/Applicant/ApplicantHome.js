import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider, Portal, Modal, FAB } from 'react-native-paper';
import JobsList from '../../components/Job/JobsList'; // Import component vừa tách
import JobFilterModal from '../../components/Job/JobFilterModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const ApplicantHome = ({ navigation }) => {
    const [filters, setFilters] = useState({
        category_id: null,
        location_id: null,
        salary_min: null,
        ordering: '-created_at'
    });

    const isFocused = useIsFocused();
    const [modalVisible, setModalVisible] = useState(false);
    const [compareCount, setCompareCount] = useState(0);

    const checkCompareList = async () => {
        const listStr = await AsyncStorage.getItem('compare_list');
        const list = listStr ? JSON.parse(listStr) : [];
        setCompareCount(list.length);
    }

    const handleOpenCompare = async () => {
        const listStr = await AsyncStorage.getItem('compare_list');
        const list = listStr ? JSON.parse(listStr) : [];
        if (list.length < 2) {
            alert("Bạn cần chọn ít nhất 2 công việc để so sánh!");
        } else {
            navigation.navigate("CompareJobs", { jobIds: list });
        }
    };

    const applyFilters = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setModalVisible(false);
    };

    useEffect(() => {
        if (isFocused) {
            checkCompareList();
        }
    }, [isFocused]);

    return (
        <Provider>
            <View style={styles.container}>
                <JobsList
                    navigation={navigation}
                    filters={filters}
                    setFilters={setFilters}
                    onOpenFilter={() => setModalVisible(true)}
                />
                <FAB
                    icon="scale-balance"
                    label={`So sánh (${compareCount})`}
                    style={styles.fab}
                    onPress={handleOpenCompare}
                    color="white"
                />
                <Portal>
                    <Modal
                        visible={modalVisible}
                        onDismiss={() => setModalVisible(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <JobFilterModal
                            currentFilters={filters}
                            onApply={applyFilters}
                            onClose={() => setModalVisible(false)}
                        />
                    </Modal>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#1976D2',
        transform: [{ scale: 0.9 }],
    },
});

export default ApplicantHome;