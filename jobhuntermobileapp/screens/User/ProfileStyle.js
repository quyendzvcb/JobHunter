import { StyleSheet } from "react-native";

export default StyleSheet.create({
    headerCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cameraIconBg: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#333',
        padding: 4,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white'
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    userCode: {
        fontSize: 13,
        color: '#6b7280',
        marginVertical: 4
    },
    upgradeBtnSmall: {
        backgroundColor: '#e5e7eb',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    upgradeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 5
    },
    premiumTag: {
        backgroundColor: '#fef3c7',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#fcd34d'
    },
    menuItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10
    },
    avatarWrapper: {
        position: 'relative',
    },
    premiumCrownOverlay: {
        position: 'absolute',
        top: -5,
        left: -5,
        backgroundColor: '#FFD700',
        padding: 4,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        zIndex: 10,
    },
});