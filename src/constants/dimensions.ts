import { Dimensions, Platform } from 'react-native';
import { isTV, TV_DIMENSIONS } from '../utils/tvUtils';

const { width, height } = Dimensions.get('window');

// TV Detection - uses Platform.isTV from react-native-tvos
export const IS_TV = isTV;

// Hero section height - varies by platform
export const HERO_HEIGHT = IS_TV ? TV_DIMENSIONS.HERO_HEIGHT : height * 0.65;

// Screen dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Tablet detection (TVs are also considered large screens)
export const IS_TABLET = width >= 768 || IS_TV;

// Device-specific constants for responsive design
export const POSTER_WIDTH = IS_TV ? TV_DIMENSIONS.POSTER_WIDTH : IS_TABLET ? 150 : 130;
export const POSTER_HEIGHT = IS_TV ? TV_DIMENSIONS.POSTER_HEIGHT : IS_TABLET ? 225 : 195;
export const GRID_COLUMNS = IS_TV ? TV_DIMENSIONS.GRID_COLUMNS : IS_TABLET ? 4 : 3;
export const CONTENT_PADDING = IS_TV ? TV_DIMENSIONS.CONTENT_PADDING : 16;
export const ITEM_SPACING = IS_TV ? TV_DIMENSIONS.ITEM_SPACING : 12;
