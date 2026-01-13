import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    header: {
        backgroundColor: '#1976D2',
        padding: 20,
        paddingBottom: 60,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    welcomeLabel: {
        color: '#BBDEFB',
        fontSize: 14,
    },

    userName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: -80,
    },

    bodyHeader: {
        padding: 16,
        marginTop: 40,
    },

    tableCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 10,
        marginBottom: 15,
    },

    filterToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },

    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#1976D2',
    },
});