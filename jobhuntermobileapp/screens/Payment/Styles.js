import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    header: {
        marginBottom: 20,
    },

    card: {
        marginBottom: 15,
        backgroundColor: 'white',
        elevation: 3,
        borderRadius: 12,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    pkgTitle: {
        fontWeight: 'bold',
        color: '#2563eb',
        fontSize: 19,
    },

    priceChip: {
        backgroundColor: '#e0f2fe',
        height: 32,
    },

    desc: {
        marginBottom: 10,
    },

    btnBuy: {
        backgroundColor: '#2563eb',
        marginTop: 10,
        borderRadius: 8,
    },
});