/**
 * TV Utility Module
 * Provides utilities for Google TV / Android TV support
 */
import { Platform, Dimensions, TVEventHandler } from 'react-native';

// TV Platform Detection
// Platform.isTV is available in react-native-tvos
export const isTV = Platform.isTV === true;
export const isAndroidTV = Platform.OS === 'android' && isTV;
export const isAppleTV = Platform.OS === 'ios' && isTV;

// Screen dimensions for TV
const { width, height } = Dimensions.get('window');

// TV screens are typically 1920x1080 or 3840x2160 (4K)
// We use these to scale UI elements appropriately
export const TV_SCREEN_WIDTH = width;
export const TV_SCREEN_HEIGHT = height;

// Scale factor for TV (10-foot UI typically uses larger elements)
// Standard mobile designs at 360dp width scale to 1920px TV = ~5.3x
// But we want readable text, so we use a more conservative scaling
export const TV_SCALE = isTV ? 1.5 : 1;

// Focus states for TV navigation
export const TV_FOCUS_SCALE = 1.08;
export const TV_FOCUS_BORDER_WIDTH = 3;
export const TV_FOCUS_BORDER_COLOR = '#2d9cdb';

// D-pad navigation constants
export const TV_REMOTE_KEYS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  SELECT: 'select',
  PLAY_PAUSE: 'playPause',
  REWIND: 'rewind',
  FAST_FORWARD: 'fastForward',
  BACK: 'back',
  MENU: 'menu',
} as const;

// TV-specific dimensions
export const TV_DIMENSIONS = {
  // Sidebar width for TV navigation
  SIDEBAR_WIDTH: isTV ? 280 : 0,

  // Content padding for safe area
  CONTENT_PADDING: isTV ? 48 : 16,

  // Poster sizes for TV (larger for 10-foot viewing)
  POSTER_WIDTH: isTV ? 200 : 130,
  POSTER_HEIGHT: isTV ? 300 : 195,

  // Hero section height
  HERO_HEIGHT: isTV ? height * 0.7 : height * 0.65,

  // Card dimensions
  CARD_WIDTH: isTV ? 320 : 160,
  CARD_HEIGHT: isTV ? 180 : 90,

  // Font sizes scaled for TV
  FONT_SIZE_SMALL: isTV ? 18 : 12,
  FONT_SIZE_MEDIUM: isTV ? 24 : 16,
  FONT_SIZE_LARGE: isTV ? 32 : 22,
  FONT_SIZE_XLARGE: isTV ? 48 : 32,
  FONT_SIZE_TITLE: isTV ? 56 : 36,

  // Button dimensions
  BUTTON_HEIGHT: isTV ? 56 : 44,
  BUTTON_PADDING: isTV ? 24 : 16,

  // List item height
  LIST_ITEM_HEIGHT: isTV ? 80 : 56,

  // Grid columns
  GRID_COLUMNS: isTV ? 6 : 3,

  // Spacing
  ITEM_SPACING: isTV ? 24 : 12,
  SECTION_SPACING: isTV ? 48 : 24,
};

// Focus style generator
export const getTVFocusStyle = (isFocused: boolean) => {
  if (!isTV) return {};

  return isFocused ? {
    transform: [{ scale: TV_FOCUS_SCALE }],
    borderWidth: TV_FOCUS_BORDER_WIDTH,
    borderColor: TV_FOCUS_BORDER_COLOR,
    shadowColor: TV_FOCUS_BORDER_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  } : {
    transform: [{ scale: 1 }],
    borderWidth: 0,
    borderColor: 'transparent',
  };
};

// TV Event Handler wrapper for managing remote control events
let tvEventHandler: TVEventHandler | null = null;
const eventListeners: Map<string, (evt: any) => void> = new Map();

export const enableTVEventHandler = () => {
  if (!isTV || tvEventHandler) return;

  tvEventHandler = new TVEventHandler();
  tvEventHandler.enable(undefined, (cmp, evt) => {
    eventListeners.forEach((listener) => {
      listener(evt);
    });
  });
};

export const disableTVEventHandler = () => {
  if (tvEventHandler) {
    tvEventHandler.disable();
    tvEventHandler = null;
  }
  eventListeners.clear();
};

export const addTVEventListener = (id: string, listener: (evt: any) => void) => {
  eventListeners.set(id, listener);
  if (!tvEventHandler) {
    enableTVEventHandler();
  }
};

export const removeTVEventListener = (id: string) => {
  eventListeners.delete(id);
  if (eventListeners.size === 0) {
    disableTVEventHandler();
  }
};

// Utility to scale values for TV
export const scaleForTV = (value: number, tvMultiplier: number = TV_SCALE): number => {
  return isTV ? value * tvMultiplier : value;
};

// Utility to get platform-specific value
export const getTVValue = <T>(mobileValue: T, tvValue: T): T => {
  return isTV ? tvValue : mobileValue;
};

// TV safe area insets (Google TV typically has 48px safe area)
export const TV_SAFE_AREA = {
  top: isTV ? 27 : 0,
  bottom: isTV ? 27 : 0,
  left: isTV ? 48 : 0,
  right: isTV ? 48 : 0,
};

export default {
  isTV,
  isAndroidTV,
  isAppleTV,
  TV_SCALE,
  TV_DIMENSIONS,
  TV_SAFE_AREA,
  TV_FOCUS_SCALE,
  TV_FOCUS_BORDER_COLOR,
  TV_REMOTE_KEYS,
  getTVFocusStyle,
  scaleForTV,
  getTVValue,
  enableTVEventHandler,
  disableTVEventHandler,
  addTVEventListener,
  removeTVEventListener,
};
