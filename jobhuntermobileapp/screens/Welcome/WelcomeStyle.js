import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Màu xanh chủ đạo (bạn có thể thay mã màu này bằng mã màu trong LoginStyle cũ của bạn nếu muốn giống hệt)
const PRIMARY_COLOR = '#1976D2';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Nền trắng toàn màn hình
        padding: 24,
        justifyContent: 'space-between', // Phân bố đều nội dung
        alignItems: 'center',
    },
    // Khu vực hình ảnh minh họa
    headerContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        width: width * 0.8, // Chiếm 80% chiều ngang màn hình
        height: width * 0.8,
        resizeMode: 'contain',
    },
    // Khu vực tiêu đề và mô tả
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
    // Khu vực nút bấm
    footerContainer: {
        flex: 1.5,
        width: '100%',
        justifyContent: 'flex-end',
        marginBottom: 20,
        gap: 16, // Khoảng cách giữa các nút
    },
    // Style cho nút chính (Khám phá, Đăng nhập) - Nền xanh
    btnPrimary: {
        width: '100%',
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 16,
        borderRadius: 30, // Bo tròn đẹp
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6, // Đổ bóng cho Android
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase', // Chữ in hoa cho nút chính
    },
    // Style cho nút phụ (Đăng ký) - Nền trắng, viền xanh hoặc xám
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
    // Link text nhỏ ở dưới cùng
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