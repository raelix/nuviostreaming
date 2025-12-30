/**
 * TVFocusContext
 * Manages focus navigation between TV sidebar and content areas.
 *
 * This context allows the sidebar to register its focusable items,
 * and content areas to use those refs for nextFocusLeft navigation.
 */
import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { findNodeHandle } from 'react-native';
import { isTV } from '../utils/tvUtils';

interface TVFocusContextType {
  // Register a sidebar item ref (called by TVSidebar)
  registerSidebarItem: (index: number, ref: any) => void;
  // Unregister a sidebar item ref
  unregisterSidebarItem: (index: number) => void;
  // Get the node handle for a sidebar item (to use with nextFocusLeft)
  getSidebarNodeHandle: (index?: number) => number | null;
  // Get the first sidebar item's node handle
  getFirstSidebarNodeHandle: () => number | null;
  // Track if sidebar has focus
  sidebarHasFocus: boolean;
  setSidebarHasFocus: (hasFocus: boolean) => void;
}

const TVFocusContext = createContext<TVFocusContextType | null>(null);

export const TVFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sidebarRefs = useRef<Map<number, any>>(new Map());
  const [sidebarHasFocus, setSidebarHasFocus] = useState(false);

  const registerSidebarItem = useCallback((index: number, ref: any) => {
    if (ref) {
      sidebarRefs.current.set(index, ref);
    }
  }, []);

  const unregisterSidebarItem = useCallback((index: number) => {
    sidebarRefs.current.delete(index);
  }, []);

  const getSidebarNodeHandle = useCallback((index: number = 0): number | null => {
    const ref = sidebarRefs.current.get(index);
    if (ref) {
      return findNodeHandle(ref);
    }
    return null;
  }, []);

  const getFirstSidebarNodeHandle = useCallback((): number | null => {
    // Get the first available sidebar item
    const sortedKeys = Array.from(sidebarRefs.current.keys()).sort((a, b) => a - b);
    if (sortedKeys.length > 0) {
      const ref = sidebarRefs.current.get(sortedKeys[0]);
      if (ref) {
        return findNodeHandle(ref);
      }
    }
    return null;
  }, []);

  const value: TVFocusContextType = {
    registerSidebarItem,
    unregisterSidebarItem,
    getSidebarNodeHandle,
    getFirstSidebarNodeHandle,
    sidebarHasFocus,
    setSidebarHasFocus,
  };

  return (
    <TVFocusContext.Provider value={value}>
      {children}
    </TVFocusContext.Provider>
  );
};

export const useTVFocus = (): TVFocusContextType => {
  const context = useContext(TVFocusContext);
  if (!context) {
    // Return a no-op implementation for non-TV or when context is missing
    return {
      registerSidebarItem: () => {},
      unregisterSidebarItem: () => {},
      getSidebarNodeHandle: () => null,
      getFirstSidebarNodeHandle: () => null,
      sidebarHasFocus: false,
      setSidebarHasFocus: () => {},
    };
  }
  return context;
};

export default TVFocusContext;
