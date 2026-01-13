import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, TextInput, RadioButton, Chip } from 'react-native-paper';
import APIs, { endpoints } from '../../utils/Apis';

const JobFilterModal = ({ currentFilters, onApply }) => {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);

    // Local state cho form
    const [selectedCate, setSelectedCate] = useState(currentFilters.category_id);
    const [selectedLocs, setSelectedLocs] = useState(currentFilters.location_id || []);
    const [minSalary, setMinSalary] = useState(currentFilters.salary_min);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resCate = await APIs.get(endpoints['categories']);
                const resLoc = await APIs.get(endpoints['locations']);
                setCategories(resCate.data);
                setLocations(resLoc.data);
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, []);

    console.log(selectedLocs)

    const handleApply = () => {
        onApply({
            category_id: selectedCate,
            location_id: selectedLocs,
            salary_min: minSalary
        });
    };

    const toggleLocation = (id) => {
        if (selectedLocs.includes(id)) {
            setSelectedLocs(selectedLocs.filter(locId => locId !== id));
        } else {
            setSelectedLocs([...selectedLocs, id]);
        }
    };

    const handleReset = () => {
        setSelectedCate(null);
        setSelectedLocs([]);
        setMinSalary(null);
    };

    return (
        <View>
            <Text style={styles.title}>Bộ lọc tìm kiếm</Text>

            <Text style={styles.label}>Ngành nghề:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {categories.map(c => (
                    <Chip
                        key={c.id}
                        selected={selectedCate === c.id}
                        onPress={() => setSelectedCate(selectedCate === c.id ? null : c.id)}
                        style={styles.chip}
                    >
                        {c.name}
                    </Chip>
                ))}
            </ScrollView>

            <Text style={styles.label}>Địa điểm:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {locations.map(l => (
                    <Chip
                        key={l.id}
                        selected={selectedLocs.map(Number).includes(Number(l.id))}
                        onPress={() => toggleLocation(l.id)}
                        style={styles.chip}
                    >
                        {l.city}
                    </Chip>
                ))}
            </ScrollView>

            <Text style={styles.label}>Mức lương tối thiểu ($):</Text>
            <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={minSalary ? minSalary.toString() : ''}
                onChangeText={setMinSalary}
                placeholder="Nhập mức lương mong muốn"
            />

            <View style={styles.btnRow}>
                <Button onPress={handleReset} textColor="red">Đặt lại</Button>
                <Button mode="contained" onPress={handleApply}>Áp dụng</Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { marginTop: 10, marginBottom: 5, fontWeight: '600' },
    scrollRow: { flexDirection: 'row', marginBottom: 10 },
    chip: { marginRight: 8 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }
});

export default JobFilterModal;