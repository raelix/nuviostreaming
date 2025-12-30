/**
 * useTVNavigation Hook
 * Provides TV-specific navigation utilities for screens.
 *
 * Usage:
 * ```tsx
 * const { sidebarNodeHandle, tvProps } = useTVNavigation();
 *
 * // Use tvProps on your first focusable element
 * <TouchableOpacity {...tvProps}>
 *   First item
 * </TouchableOpacity>
 * ```
 */
import { useEffect, useState, useMemo } from 'react';
import { isTV } from '../utils/tvUtils';
import { useTVFocus } from '../contexts/TVFocusContext';

interface TVNavigationResult {
  // Node handle of the sidebar's first item (use with nextFocusLeft)
  sidebarNodeHandle: number | null;
  // TV props to spread on the first focusable element in your screen
  tvProps: {
    nextFocusLeft?: number;
    isTVSelectable?: boolean;
  };
  // Whether we're on a TV platform
  isTV: boolean;
}

export const useTVNavigation = (): TVNavigationResult => {
  const { getFirstSidebarNodeHandle } = useTVFocus();
  const [sidebarNodeHandle, setSidebarNodeHandle] = useState<number | null>(null);

  useEffect(() => {
    if (!isTV) return;

    const updateHandle = () => {
      const handle = getFirstSidebarNodeHandle();
      if (handle !== sidebarNodeHandle) {
        setSidebarNodeHandle(handle);
      }
    };

    // Initial update
    updateHandle();

    // Update periodically to catch ref changes
    const interval = setInterval(updateHandle, 500);

    return () => clearInterval(interval);
  }, [getFirstSidebarNodeHandle, sidebarNodeHandle]);

  const tvProps = useMemo(() => {
    if (!isTV) return {};

    const props: { nextFocusLeft?: number; isTVSelectable?: boolean } = {
      isTVSelectable: true,
    };

    if (sidebarNodeHandle) {
      props.nextFocusLeft = sidebarNodeHandle;
    }

    return props;
  }, [sidebarNodeHandle]);

  return {
    sidebarNodeHandle,
    tvProps,
    isTV,
  };
};

export default useTVNavigation;
