import { StyleSheet, Dimensions, Platform } from 'react-native';
import { isTV, TV_DIMENSIONS } from '../utils/tvUtils';

const { width, height } = Dimensions.get('window');

// Dynamic poster calculation based on screen width and platform
const calculatePosterLayout = (screenWidth: number) => {
  // TV-specific calculations for 10-foot UI
  if (isTV) {
    const TV_POSTER_WIDTH = TV_DIMENSIONS.POSTER_WIDTH;
    const availableWidth = screenWidth - TV_DIMENSIONS.SIDEBAR_WIDTH - (TV_DIMENSIONS.CONTENT_PADDING * 2);
    const numColumns = Math.floor(availableWidth / (TV_POSTER_WIDTH + TV_DIMENSIONS.ITEM_SPACING));
    return {
      numColumns: Math.min(numColumns, TV_DIMENSIONS.GRID_COLUMNS),
      posterWidth: TV_POSTER_WIDTH,
      spacing: TV_DIMENSIONS.ITEM_SPACING,
    };
  }

  const MIN_POSTER_WIDTH = 110; // Minimum poster width for readability
  const MAX_POSTER_WIDTH = 140; // Maximum poster width to prevent oversized posters
  const HORIZONTAL_PADDING = 50; // Total horizontal padding/margins

  // Calculate how many posters can fit
  const availableWidth = screenWidth - HORIZONTAL_PADDING;
  const maxColumns = Math.floor(availableWidth / MIN_POSTER_WIDTH);

  // Limit to reasonable number of columns (3-6)
  const numColumns = Math.min(Math.max(maxColumns, 3), 6);

  // Calculate actual poster width
  const posterWidth = Math.min(availableWidth / numColumns, MAX_POSTER_WIDTH);

  return {
    numColumns,
    posterWidth,
    spacing: 12 // Space between posters
  };
};

const posterLayout = calculatePosterLayout(width);
export const POSTER_WIDTH = posterLayout.posterWidth;
export const POSTER_HEIGHT = POSTER_WIDTH * 1.5;
export const HORIZONTAL_PADDING = isTV ? TV_DIMENSIONS.CONTENT_PADDING : 16;

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: isTV ? TV_DIMENSIONS.SECTION_SPACING : 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTV ? 20 : 12,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  sectionTitle: {
    fontSize: isTV ? TV_DIMENSIONS.FONT_SIZE_LARGE : 18,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: isTV ? TV_DIMENSIONS.FONT_SIZE_MEDIUM : 14,
    marginRight: 4,
  },
});

export default {
  POSTER_WIDTH,
  POSTER_HEIGHT,
  HORIZONTAL_PADDING,
  posterLayout,
}; 