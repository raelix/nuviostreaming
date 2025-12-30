/**
 * TVScreenWrapper Component
 * A simple wrapper for TV screen content that ensures proper focus navigation.
 *
 * This wrapper:
 * 1. Creates a focus guide at the left edge to redirect focus to sidebar
 * 2. Ensures content is properly focusable
 * 3. Works with the TVFocusContext to find sidebar refs
 *
 * Usage:
 * ```tsx
 * import { TVScreenWrapper } from '../components/tv/TVScreenWrapper';
 *
 * const MyScreen = () => (
 *   <TVScreenWrapper>
 *     <YourContent />
 *   </TVScreenWrapper>
 * );
 * ```
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TVFocusGuideView,
  findNodeHandle,
  TouchableOpacity,
} from 'react-native';
import { isTV } from '../../utils/tvUtils';
import { useTVFocus } from '../../contexts/TVFocusContext';

interface TVScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
}

const TVScreenWrapper: React.FC<TVScreenWrapperProps> = ({ children, style }) => {
  const { getFirstSidebarNodeHandle } = useTVFocus();
  const leftGuideRef = useRef<View>(null);
  const [destinations, setDestinations] = useState<number[]>([]);

  // Update destinations when sidebar ref is available
  useEffect(() => {
    if (!isTV) return;

    const updateDestinations = () => {
      const sidebarHandle = getFirstSidebarNodeHandle();
      if (sidebarHandle) {
        setDestinations([sidebarHandle]);
      }
    };

    // Initial update
    updateDestinations();

    // Update periodically to catch ref changes
    const interval = setInterval(updateDestinations, 500);

    return () => clearInterval(interval);
  }, [getFirstSidebarNodeHandle]);

  // On non-TV platforms, just render children directly
  if (!isTV) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Left edge focus guide - catches left navigation and redirects to sidebar */}
      <TVFocusGuideView
        style={styles.leftGuide}
        destinations={destinations.length > 0 ? destinations : undefined}
      >
        <View ref={leftGuideRef} style={styles.leftGuideInner} />
      </TVFocusGuideView>

      {/* Main content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftGuide: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20, // Thin guide at the left edge
    zIndex: 10,
  },
  leftGuideInner: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default TVScreenWrapper;
