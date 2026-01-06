import { StyleSheet } from "react-native";

const PRIMARY_BLUE = "#2563eb";
const LIGHT_GRAY = "#f9fafb";
const BORDER_COLOR = "#e5e7eb";

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
        paddingTop: 60,
        paddingBottom: 30,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoContainer: {
        width: 70,
        height: 70,
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // Đổ bóng cho logo icon
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: PRIMARY_BLUE,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 15,
        color: "#6b7280",
        marginTop: 5,
    },
    form: {
        marginTop: 10,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#4b5563",
        marginBottom: 8,
        textTransform: 'uppercase',
        marginLeft: 4,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: LIGHT_GRAY,
        borderRadius: 12,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: PRIMARY_BLUE,
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 12,
        paddingVertical: 8,
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    loginButtonLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: BORDER_COLOR,
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#9ca3af",
        fontSize: 12,
        fontWeight: "600",
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    socialButton: {
        flex: 0.48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        backgroundColor: '#ffffff',
    },
    socialText: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: "600",
        color: "#1f2937",
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 'auto',
    },
    signupText: {
        color: "#6b7280",
        fontSize: 14,
    },
    signupLink: {
        color: PRIMARY_BLUE,
        fontWeight: "700",
        fontSize: 14,
    }
});