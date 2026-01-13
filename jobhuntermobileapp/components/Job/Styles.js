import { StyleSheet } from "react-native";

export default StyleSheet.create({
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