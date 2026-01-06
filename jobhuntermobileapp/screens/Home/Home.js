import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, RefreshControl, Image } from "react-native";
import { Searchbar, Text, Chip, ActivityIndicator, Card } from "react-native-paper";
import Apis, { endpoints } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [cateId, setCateId] = useState(null);
    const nav = useNavigation();

    useEffect(() => {
        const loadCates = async () => {
            try {
                const res = await Apis.get(endpoints['categories']);
                setCategories(res.data.results);
            } catch (e) { console.error(e); }
        }
        loadCates();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            let url = `${endpoints['jobs']}?q=${q}`;
            if (cateId) url += `&category_id=${cateId}`;
            const res = await Apis.get(url);
            setJobs(res.data.results);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { loadJobs(); }, [q, cateId]);

    const renderJob = ({ item }) => (
        <TouchableOpacity onPress={() => nav.navigate("JobDetail", { jobId: item.id })}>
            <Card style={MyStyles.card}>
                <Card.Content style={{ flexDirection: 'row' }}>
                    <Image source={{ uri: item.recruiter.logo || 'https://via.placeholder.com/60' }} style={{ width: 60, height: 60, borderRadius: 5, marginRight: 15 }} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }} numberOfLines={2}>{item.title}</Text>
                        <Text variant="bodySmall" style={{ color: 'gray' }}>{item.recruiter.company_name}</Text>
                        <View style={[MyStyles.row, { justifyContent: 'space-between', marginTop: 5 }]}>
                            <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>{item.salary_min ? `$${item.salary_min}` : 'Thỏa thuận'}</Text>
                            <Text style={{ fontSize: 10, color: 'gray' }}>{moment(item.created_at).fromNow()}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={MyStyles.container}>
            <View style={{ backgroundColor: '#d32f2f', padding: 20, paddingBottom: 10 }}>
                <Searchbar placeholder="Tìm việc, công ty..." value={q} onChangeText={setQ} style={{ borderRadius: 10, backgroundColor: 'white' }} />
                <FlatList
                    horizontal data={categories} showsHorizontalScrollIndicator={false}
                    keyExtractor={i => i.id.toString()}
                    style={{ marginTop: 10 }}
                    renderItem={({ item }) => (
                        <Chip
                            selected={cateId === item.id}
                            onPress={() => setCateId(cateId === item.id ? null : item.id)}
                            style={{ marginRight: 8, backgroundColor: cateId === item.id ? '#ffcdd2' : 'white' }}
                        >{item.name}</Chip>
                    )}
                />
            </View>
            <View style={{ flex: 1, padding: 10 }}>
                {loading ? <ActivityIndicator color="#d32f2f" /> : (
                    <FlatList
                        data={jobs}
                        renderItem={renderJob}
                        keyExtractor={i => i.id.toString()}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} />}
                    />
                )}
            </View>
        </View>
    );
}

export default Home;