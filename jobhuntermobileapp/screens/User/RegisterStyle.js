import { StyleSheet } from "react-native";

const PRIMARY_BLUE = "#2563eb";
const LIGHT_GRAY = "#f9fafb";
const BORDER_COLOR = "#e5e7eb";
const TEXT_COLOR = "#1f2937";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 30,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: PRIMARY_BLUE,
        letterSpacing: 1,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 15,
        color: "#6b7280",
    },

    roleContainer: {
        flexDirection: 'row',
        backgroundColor: LIGHT_GRAY,
        borderRadius: 15,
        padding: 5,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    roleButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    roleText: {
        fontWeight: "600",
        color: "#6b7280",
        fontSize: 14,
    },
    roleTextActive: {
        color: PRIMARY_BLUE,
        fontWeight: "700",
    },

    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: PRIMARY_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: LIGHT_GRAY,
        overflow: 'hidden',
        borderStyle: 'dashed',
    },
    avatarWrapperSelected: {
        borderStyle: 'solid',
    },
    avatarLabel: {
        marginTop: 10,
        fontSize: 14,
        color: PRIMARY_BLUE,
        fontWeight: "600"
    },

    form: {
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: LIGHT_GRAY,
        borderRadius: 12,
        fontSize: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: TEXT_COLOR,
        marginBottom: 15,
        marginTop: 10,
        borderLeftWidth: 3,
        borderLeftColor: PRIMARY_BLUE,
        paddingLeft: 10,
    },

    registerButton: {
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    registerButtonLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
        paddingVertical: 2,
    },

    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    loginText: {
        color: "#6b7280",
        fontSize: 14,
    },
    loginLink: {
        color: PRIMARY_BLUE,
        fontWeight: "700",
        fontSize: 14,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    halfInput: {
        flex: 0.48,
    },
    radioLabel: {
        marginLeft: 8,
        color: TEXT_COLOR,
        fontSize: 15
    }
});