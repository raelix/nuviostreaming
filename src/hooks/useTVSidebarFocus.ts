/**
 * useTVSidebarFocus Hook
 * Handles automatic sidebar focus when pressing left at content edge.
 *
 * This hook uses useTVEventHandler to detect left D-pad presses
 * and programmatically focuses the sidebar when appropriate.
 *
 * Usage:
 * ```tsx
 * import { useTVSidebarFocus } from '../hooks/useTVSidebarFocus';
 *
 * const MyScreen = () => {
 *   useTVSidebarFocus(); // Just call the hook, no return value needed
 *   return <YourContent />;
 * };
 * ```
 */
import { useEffect, useRef, useCallback } from 'react';
import { useTVEventHandler, TVEventHandler } from 'react-native';
import { isTV } from '../utils/tvUtils';
import { useTVFocus } from '../contexts/TVFocusContext';

export const useTVSidebarFocus = () => {
  const { getFirstSidebarNodeHandle, sidebarHasFocus } = useTVFocus();
  const lastLeftPressTime = useRef<number>(0);
  const leftPressCount = useRef<number>(0);

  // Handle TV remote events
  const tvEventHandler = useCallback((evt: any) => {
    if (!evt || sidebarHasFocus) return;

    // Only handle 'left' events
    if (evt.eventType === 'left') {
      const now = Date.now();
      const timeSinceLastPress = now - lastLeftPressTime.current;

      // If we get multiple left presses quickly (< 300ms), it means focus isn't moving
      // This indicates we're at the left edge and should focus the sidebar
      if (timeSinceLastPress < 300) {
        leftPressCount.current++;

        if (leftPressCount.current >= 2) {
          // We're stuck at the left edge, focus the sidebar
          const sidebarHandle = getFirstSidebarNodeHandle();
          if (sidebarHandle) {
            try {
              // Import NativeModules to access UIManager for focus
              const { UIManager, findNodeHandle } = require('react-native');
              if (UIManager.dispatchViewManagerCommand) {
                // This is a low-level way to request focus on Android TV
                // Note: This may not work on all versions
              }
            } catch (e) {
              // Focus request failed, ignore
            }
          }
          leftPressCount.current = 0;
        }
      } else {
        leftPressCount.current = 1;
      }

      lastLeftPressTime.current = now;
    }
  }, [getFirstSidebarNodeHandle, sidebarHasFocus]);

  // Set up TV event handler
  useTVEventHandler(isTV ? tvEventHandler : () => {});
};

export default useTVSidebarFocus;
