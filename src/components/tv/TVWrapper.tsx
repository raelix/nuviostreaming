/**
 * TVWrapper Component
 * Provides TVFocusGuideView functionality for proper focus management on TV.
 * Based on react-native-tvos best practices.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { isTV } from '../../utils/tvUtils';

// TVFocusGuideView is only available in react-native-tvos
let TVFocusGuideView: any = null;
if (isTV) {
  try {
    const RN = require('react-native');
    TVFocusGuideView = RN.TVFocusGuideView;
  } catch (e) {
    // Not available
  }
}

interface TVWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  // Focus guide options
  autoFocus?: boolean;
  trapFocusUp?: boolean;
  trapFocusDown?: boolean;
  trapFocusLeft?: boolean;
  trapFocusRight?: boolean;
  // Destinations for focus navigation
  destinations?: React.RefObject<View>[];
}

/**
 * TVWrapper - Wraps content with TVFocusGuideView on TV platforms
 *
 * Usage:
 * ```tsx
 * <TVWrapper autoFocus trapFocusLeft>
 *   <YourContent />
 * </TVWrapper>
 * ```
 */
const TVWrapper: React.FC<TVWrapperProps> = ({
  children,
  style,
  autoFocus = false,
  trapFocusUp = false,
  trapFocusDown = false,
  trapFocusLeft = false,
  trapFocusRight = false,
  destinations,
}) => {
  // On non-TV platforms, just render children
  if (!isTV || !TVFocusGuideView) {
    return <View style={style}>{children}</View>;
  }

  return (
    <TVFocusGuideView
      style={[styles.container, style]}
      autoFocus={autoFocus}
      trapFocusUp={trapFocusUp}
      trapFocusDown={trapFocusDown}
      trapFocusLeft={trapFocusLeft}
      trapFocusRight={trapFocusRight}
      destinations={destinations}
    >
      {children}
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});

export default TVWrapper;

/**
 * TVRow - Horizontal focus guide for rows of content
 * Traps focus within the row (left/right navigation)
 */
export const TVRow: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  trapFocus?: boolean;
}> = ({ children, style, trapFocus = true }) => {
  if (!isTV || !TVFocusGuideView) {
    return <View style={[styles.row, style]}>{children}</View>;
  }

  return (
    <TVFocusGuideView
      style={[styles.row, style]}
      trapFocusUp={trapFocus}
      trapFocusDown={trapFocus}
    >
      {children}
    </TVFocusGuideView>
  );
};

/**
 * TVColumn - Vertical focus guide for columns
 * Traps focus within the column (up/down navigation)
 */
export const TVColumn: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  trapFocus?: boolean;
}> = ({ children, style, trapFocus = true }) => {
  if (!isTV || !TVFocusGuideView) {
    return <View style={[styles.column, style]}>{children}</View>;
  }

  return (
    <TVFocusGuideView
      style={[styles.column, style]}
      trapFocusLeft={trapFocus}
      trapFocusRight={trapFocus}
    >
      {children}
    </TVFocusGuideView>
  );
};
