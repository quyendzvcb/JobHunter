import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Unified TextInput Component cho toàn bộ ứng dụng
 * 
 * Props:
 * - label: string - Nhãn input
 * - value: string - Giá trị hiện tại
 * - onChangeText?: function - Callback khi text thay đổi (React Native convention)
 * - onChange?: function - Callback khi text thay đổi (alternative - priority thấp hơn onChangeText)
 * - placeholder?: string - Text gợi ý
 * - icon?: string - Icon từ MaterialCommunityIcons
 * - secure?: boolean - Ẩn text (cho password)
 * - rightIcon?: ReactNode - Component bên phải input
 * - style?: object - Style tùy chỉnh
 * - wrapperStyle?: object - Style cho wrapper View
 * - errorText?: string - Text lỗi hiển thị dưới input
 * - helperText?: string - Text hỗ trợ dưới input
 * - keyboardType?: string - Loại bàn phím (default, numeric, email-address, phone-pad, decimal-pad)
 * - multiline?: boolean - Cho phép nhập nhiều dòng
 * - numberOfLines?: number - Số dòng
 * - maxLength?: number - Độ dài tối đa
 * - mode?: string - 'outlined' (default) hoặc 'flat'
 * - editable?: boolean - Có thể chỉnh sửa hay không
 * - disabled?: boolean - Vô hiệu hóa input
 * - onPress?: function - Callback khi bấm input (dùng cho modal/dropdown - làm input readonly)
 * - outlineColor?: string - Màu viền
 * - activeOutlineColor?: string - Màu viền khi active
 * - textColor?: string - Màu text
 * - iconColor?: string - Màu icon
 * - backgroundColor?: string - Màu nền
 * 
 * Ví dụ:
 * <UnifiedTextInput 
 *     label="Số điện thoại"
 *     value={phone}
 *     onChangeText={setPhone}
 *     icon="phone"
 *     keyboardType="phone-pad"
 * />
 */
const UnifiedTextInput = ({
    label,
    value,
    onChangeText = null,
    onChange = null,
    placeholder = '',
    icon = null,
    secure = false,
    rightIcon = null,
    style = {},
    wrapperStyle = {},
    errorText = null,
    helperText = null,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    maxLength = null,
    mode = 'outlined',
    editable = true,
    disabled = false,
    outlineColor = '#e5e7eb',
    activeOutlineColor = '#2563eb',
    textColor = '#1f2937',
    iconColor = '#2563eb',
    backgroundColor = '#f9fafb',
    onPress = null,
}) => {
    // Handle text change - Priority: onChangeText > onChange
    const handleTextChange = (text) => {
        if (onChangeText) {
            onChangeText(text);
        } else if (onChange) {
            onChange(text);
        }
    };

    return (
        <View style={wrapperStyle}>
            {onPress ? (
                // Modal/Dropdown mode - TouchableOpacity wrapper
                <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                    <View pointerEvents="none">
                        <TextInput
                            mode={mode}
                            label={label}
                            value={value}
                            placeholder={placeholder}
                            editable={false}
                            style={[{ backgroundColor }, style]}
                            outlineColor={errorText ? '#B00020' : outlineColor}
                            activeOutlineColor={errorText ? '#B00020' : activeOutlineColor}
                            textColor={textColor}
                            left={
                                icon ? (
                                    <TextInput.Icon
                                        icon={() => (
                                            <View pointerEvents="none" style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <MaterialCommunityIcons
                                                    name={icon}
                                                    size={24}
                                                    color={errorText ? '#B00020' : iconColor}
                                                />
                                            </View>
                                        )}
                                    />
                                ) : null
                            }
                            right={rightIcon}
                        />
                    </View>
                </TouchableOpacity>
            ) : (
                // Normal editable mode
                <TextInput
                    mode={mode}
                    label={label}
                    value={value}
                    onChangeText={handleTextChange}
                    placeholder={placeholder}
                    secureTextEntry={secure}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    editable={editable && !disabled}
                    style={[{ backgroundColor }, style]}
                    outlineColor={errorText ? '#B00020' : outlineColor}
                    activeOutlineColor={errorText ? '#B00020' : activeOutlineColor}
                    textColor={textColor}
                    left={
                        icon ? (
                            <TextInput.Icon
                                icon={() => (
                                    <View pointerEvents="none" style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <MaterialCommunityIcons
                                            name={icon}
                                            size={24}
                                            color={errorText ? '#B00020' : iconColor}
                                        />
                                    </View>
                                )}
                            />
                        ) : null
                    }
                    right={rightIcon}
                />
            )}
            {errorText && (
                <HelperText type="error" visible={true} style={{ paddingLeft: 0, fontSize: 12 }}>
                    {errorText}
                </HelperText>
            )}
            {helperText && !errorText && (
                <HelperText type="info" visible={true} style={{ paddingLeft: 0, fontSize: 12 }}>
                    {helperText}
                </HelperText>
            )}
        </View>
    );
};

export default UnifiedTextInput;