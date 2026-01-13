import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const PRIMARY_COLOR = '#1976D2';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain',
    },

    bodyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
        textAlign: 'center',
        marginBottom: 12,
    },
    subTitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    footerContainer: {
        flex: 1.5,
        width: '100%',
        justifyContent: 'flex-end',
        marginBottom: 20,
        gap: 16,
    },

    btnPrimary: {
        width: '100%',
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    btnSecondary: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnSecondaryText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    footerTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    linkText: {
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
        fontSize: 14,
    }
});