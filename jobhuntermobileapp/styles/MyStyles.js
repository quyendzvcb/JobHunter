import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', marginTop: 30 },
    content: { padding: 20 },
    center: { justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },

    // Typography
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1976D2', marginBottom: 10, textAlign: 'center' },
    subTitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 },

    // Components
    card: { backgroundColor: 'white', marginBottom: 10, elevation: 2, borderRadius: 8 },
    input: { marginBottom: 15, backgroundColor: 'white' },
    btnPrimary: { backgroundColor: '#1976D2', borderRadius: 8, marginVertical: 5 },
    btnOutline: { borderColor: '#1976D2', borderRadius: 8, marginVertical: 10 },

    // Helpers
    mt20: { marginTop: 20 },
    mb20: { marginBottom: 20 },
});