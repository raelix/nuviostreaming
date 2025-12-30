/**
 * TVFocusableContent Component
 * Wraps content areas on TV to enable proper focus navigation back to sidebar.
 *
 * Usage:
 * Wrap your screen content with this component to enable:
 * - Left D-pad navigation back to sidebar
 * - Proper focus guide setup
 *
 * Example:
 * ```tsx
 * <TVFocusableContent>
 *   <YourScreenContent />
 * </TVFocusableContent>
 * ```
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TVFocusGuideView, findNodeHandle } from 'react-native';
import { isTV } from '../../utils/tvUtils';
import { useTVFocus } from '../../contexts/TVFocusContext';

interface TVFocusableContentProps {
  children: React.ReactNode;
  style?: any;
}

const TVFocusableContent: React.FC<TVFocusableContentProps> = ({ children, style }) => {
  const { getFirstSidebarNodeHandle, sidebarHasFocus } = useTVFocus();
  const [sidebarDestination, setSidebarDestination] = useState<number | null>(null);
  const contentRef = useRef<View>(null);

  // Get sidebar node handle for focus destination
  useEffect(() => {
    if (!isTV) return;

    // Periodically update the sidebar destination in case refs change
    const updateDestination = () => {
      const nodeHandle = getFirstSidebarNodeHandle();
      if (nodeHandle && nodeHandle !== sidebarDestination) {
        setSidebarDestination(nodeHandle);
      }
    };

    // Initial update
    updateDestination();

    // Update periodically in case refs change
    const interval = setInterval(updateDestination, 1000);

    return () => clearInterval(interval);
  }, [getFirstSidebarNodeHandle, sidebarDestination]);

  // On non-TV platforms, just render children
  if (!isTV) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  // On TV, wrap with TVFocusGuideView for proper navigation
  return (
    <TVFocusGuideView
      style={[styles.container, style]}
      autoFocus={!sidebarHasFocus}
      // Allow focus to escape in all directions except trap it when needed
      trapFocusUp={false}
      trapFocusDown={false}
      trapFocusLeft={false}
      trapFocusRight={false}
      // Destinations array guides focus - when pressing left, focus goes to sidebar
      destinations={sidebarDestination ? [sidebarDestination] : undefined}
    >
      {children}
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TVFocusableContent;
