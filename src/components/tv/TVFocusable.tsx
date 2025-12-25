/**
 * TVFocusable Component
 * A wrapper component that makes any child focusable via TV remote D-pad navigation.
 * Provides visual feedback when focused and handles press events.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
  findNodeHandle,
} from 'react-native';
import { isTV, getTVFocusStyle, TV_FOCUS_SCALE, TV_FOCUS_BORDER_COLOR } from '../../utils/tvUtils';

interface TVFocusableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle | ViewStyle[];
  focusedStyle?: ViewStyle;
  disabled?: boolean;
  hasTVPreferredFocus?: boolean;
  nextFocusUp?: React.RefObject<View>;
  nextFocusDown?: React.RefObject<View>;
  nextFocusLeft?: React.RefObject<View>;
  nextFocusRight?: React.RefObject<View>;
  activeOpacity?: number;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const TVFocusable: React.FC<TVFocusableProps> = ({
  children,
  onPress,
  onLongPress,
  onFocus,
  onBlur,
  style,
  focusedStyle,
  disabled = false,
  hasTVPreferredFocus = false,
  nextFocusUp,
  nextFocusDown,
  nextFocusLeft,
  nextFocusRight,
  activeOpacity = 0.8,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const viewRef = useRef<View>(null);

  // Animate scale on focus change
  useEffect(() => {
    if (!isTV) return;

    Animated.spring(scaleAnim, {
      toValue: isFocused ? TV_FOCUS_SCALE : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isFocused, scaleAnim]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // For mobile, just use regular TouchableOpacity
  if (!isTV) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        style={style}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Build nextFocus props for TV navigation
  const nextFocusProps: any = {};
  if (nextFocusUp?.current) {
    nextFocusProps.nextFocusUp = findNodeHandle(nextFocusUp.current) ?? undefined;
  }
  if (nextFocusDown?.current) {
    nextFocusProps.nextFocusDown = findNodeHandle(nextFocusDown.current) ?? undefined;
  }
  if (nextFocusLeft?.current) {
    nextFocusProps.nextFocusLeft = findNodeHandle(nextFocusLeft.current) ?? undefined;
  }
  if (nextFocusRight?.current) {
    nextFocusProps.nextFocusRight = findNodeHandle(nextFocusRight.current) ?? undefined;
  }

  // TV-specific focusable view
  return (
    <TouchableOpacity
      ref={viewRef}
      onPress={onPress}
      onLongPress={onLongPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      activeOpacity={1}
      hasTVPreferredFocus={hasTVPreferredFocus}
      isTVSelectable={!disabled}
      tvParallaxProperties={{
        enabled: true,
        magnification: 1.05,
        pressMagnification: 1.0,
        pressDuration: 0.1,
      }}
      style={[
        style,
        styles.container,
        isFocused && styles.focused,
        isFocused && focusedStyle,
      ]}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...nextFocusProps}
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
        {/* Focus ring overlay */}
        {isFocused && (
          <View style={styles.focusRing} pointerEvents="none" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  animatedContainer: {
    overflow: 'visible',
  },
  focused: {
    zIndex: 10,
  },
  focusRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: TV_FOCUS_BORDER_COLOR,
    backgroundColor: 'transparent',
  },
});

export default TVFocusable;

// Export a hook for managing focus state in custom components
export const useTVFocus = () => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isTV) return;

    Animated.spring(scaleAnim, {
      toValue: isFocused ? TV_FOCUS_SCALE : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isFocused, scaleAnim]);

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return {
    isFocused,
    focusProps,
    animatedStyle,
    scaleAnim,
  };
};
