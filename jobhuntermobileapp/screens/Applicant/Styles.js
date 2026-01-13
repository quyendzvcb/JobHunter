import { StyleSheet } from "react-native";

export default StyleSheet.create({
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
    card: {
        marginBottom: 10,
        backgroundColor: 'white',
        elevation: 2,
        borderRadius: 8,
        position: 'relative',
    },
    premiumCard: {
        borderWidth: 2,
        borderColor: '#FFD700',
        backgroundColor: '#fffdf0',
    },
    hotBadge: {
        position: 'absolute',
        top: -10,
        right: -5,
        backgroundColor: 'red',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    hotText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },
});