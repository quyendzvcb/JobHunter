import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider, Portal, Modal } from 'react-native-paper';
import JobsList from '../../components/Job/JobsList'; // Import component vừa tách
import JobFilterModal from '../../components/Job/JobFilterModal';

const Home = ({ navigation }) => {
    // State bộ lọc nằm ở Screen cha để quản lý Modal dễ dàng
    const [filters, setFilters] = useState({
        category_id: null,
        location_id: null,
        salary_min: null,
        ordering: '-created_at'
    });

    const [modalVisible, setModalVisible] = useState(false);

    const applyFilters = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setModalVisible(false);
    };

    return (
        <Provider>
            <View style={styles.container}>
                <JobsList
                    navigation={navigation}
                    filters={filters}
                    setFilters={setFilters}
                    onOpenFilter={() => setModalVisible(true)}
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
    container: { flex: 1, backgroundColor: '#f5f5f5', marginTop: 30 },
    modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
});

export default Home;