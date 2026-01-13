import React, { useRef } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

const UnifiedTextInput = ({
    label,
    value,
    onChangeText,
    onPress = null,
    icon = null,
    secure = false,
    rightIcon = null,
    errorText = null,
    helperText = null,
    editable = true,
    disabled = false,
    multiline = false,
    wrapperStyle = {},
    keyboardType = 'default',
    ...props
}) => {
    const inputRef = useRef(null);
    const safeValue = value !== null && value !== undefined ? String(value) : "";

    const renderLeft = icon ? (
        <TextInput.Icon
            icon={icon}
            color={errorText ? '#B00020' : '#2563eb'}
        />
    ) : null;

    const handleChangeText = (text) => {
        // Fix: Không convert thành String nếu đã là string
        if (onChangeText) {
            onChangeText(text);
        }
    };

    if (onPress) {
        return (
            <View style={[styles.wrapper, wrapperStyle]}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={disabled}>
                    <View pointerEvents="none">
                        <TextInput
                            {...props}
                            ref={inputRef}
                            label={label}
                            value={safeValue}
                            mode="outlined"
                            editable={false}
                            left={renderLeft}
                            right={rightIcon || <TextInput.Icon icon="chevron-down" />}
                            error={!!errorText}
                            outlineColor="#e5e7eb"
                            activeOutlineColor="#2563eb"
                            cursorColor="#2563eb"
                        />
                    </View>
                </TouchableOpacity>
                {errorText && <HelperText type="error">{errorText}</HelperText>}
            </View>
        );
    }

    return (
        <View style={[styles.wrapper, wrapperStyle]}>
            <TextInput
                {...props}
                ref={inputRef}
                label={label}
                value={safeValue}
                onChangeText={handleChangeText}
                secureTextEntry={secure}
                multiline={multiline}
                keyboardType={keyboardType}
                editable={editable && !disabled}
                mode="outlined"
                left={renderLeft}
                right={rightIcon}
                error={!!errorText}
                outlineColor="#e5e7eb"
                activeOutlineColor="#2563eb"
                cursorColor="#2563eb"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                // FIX TIẾNG VIỆT
                allowFontScaling={false}
                scrollEnabled={false}
                textAlignVertical="center"
            />
            {errorText ? (
                <HelperText type="error" visible={true}>{errorText}</HelperText>
            ) : helperText ? (
                <HelperText type="info" visible={true}>{helperText}</HelperText>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 12,
        width: '100%'
    }
});

export default UnifiedTextInput;