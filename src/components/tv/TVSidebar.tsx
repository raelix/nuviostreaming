/**
 * TVSidebar Component
 * TV navigation sidebar with proper focus management.
 *
 * Focus flow:
 * - Sidebar items are focusable with D-pad navigation
 * - Pressing Right from sidebar navigates to content
 * - Pressing Left from content navigates back to sidebar
 * - Container-level focus tracking expands/collapses sidebar
 *
 * Based on:
 * - https://dev.to/amazonappdev/tv-navigation-in-react-native-a-guide-to-using-tvfocusguideview-302i
 * - https://github.com/react-native-tvos/react-native-tvos
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TVFocusGuideView,
  findNodeHandle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTVFocus } from '../../contexts/TVFocusContext';
import { TV_SAFE_AREA } from '../../utils/tvUtils';

// Sidebar dimensions
const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 260;

interface TVSidebarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TVSidebar: React.FC<TVSidebarProps> = ({ state, descriptors, navigation }) => {
  const { currentTheme } = useTheme();
  const { registerSidebarItem, unregisterSidebarItem, setSidebarHasFocus } = useTVFocus();
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;
  const itemRefs = useRef<(TouchableOpacity | null)[]>([]);

  // Animate sidebar width
  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
      useNativeDriver: false,
      friction: 10,
      tension: 100,
    }).start();
  }, [isExpanded, widthAnim]);

  // Register sidebar items with focus context
  useEffect(() => {
    itemRefs.current.forEach((ref, index) => {
      if (ref) {
        registerSidebarItem(index, ref);
      }
    });

    return () => {
      itemRefs.current.forEach((_, index) => {
        unregisterSidebarItem(index);
      });
    };
  }, [registerSidebarItem, unregisterSidebarItem, state.routes.length]);

  // Handle when any sidebar item receives focus
  const handleItemFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    setIsExpanded(true);
    setSidebarHasFocus(true);
  }, [setSidebarHasFocus]);

  // Handle when a sidebar item loses focus
  // We use a delay to check if focus moved to another sidebar item
  const handleItemBlur = useCallback((index: number) => {
    // Small delay to check if focus moved to another sidebar item
    setTimeout(() => {
      setFocusedIndex(prev => {
        if (prev === index) {
          // Focus left this item and didn't move to another sidebar item
          setIsExpanded(false);
          setSidebarHasFocus(false);
          return null;
        }
        return prev;
      });
    }, 100);
  }, [setSidebarHasFocus]);

  const getIconName = (routeName: string): string => {
    switch (routeName) {
      case 'Home': return 'home';
      case 'Library': return 'heart';
      case 'Search': return 'search';
      case 'Downloads': return 'download';
      case 'Settings': return 'settings';
      default: return 'circle';
    }
  };

  return (
    <TVFocusGuideView
      autoFocus
      trapFocusUp
      trapFocusDown
      trapFocusLeft
      style={[
        styles.focusGuide,
        { width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: widthAnim,
            paddingTop: TV_SAFE_AREA.top + 20,
            backgroundColor: isExpanded ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)',
          }
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: currentTheme.colors.primary }]}>
            {isExpanded ? 'NUVIO' : 'N'}
          </Text>
        </View>

        {/* Divider */}
        {isExpanded && <View style={styles.divider} />}

        {/* Navigation Items */}
        <View style={styles.navItems}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const isActive = state.index === index;
            const isFocused = focusedIndex === index;
            const iconName = getIconName(route.name);
            const iconColor = isFocused
              ? '#000000'
              : isActive
                ? currentTheme.colors.primary
                : 'rgba(255, 255, 255, 0.7)';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                ref={ref => {
                  itemRefs.current[index] = ref;
                  // Re-register when ref changes
                  if (ref) {
                    registerSidebarItem(index, ref);
                  }
                }}
                onPress={onPress}
                onFocus={() => handleItemFocus(index)}
                onBlur={() => handleItemBlur(index)}
                activeOpacity={1}
                style={styles.itemTouchable}
                // TV-specific props
                hasTVPreferredFocus={index === 0}
                isTVSelectable={true}
              >
                <View
                  style={[
                    styles.item,
                    {
                      backgroundColor: isFocused
                        ? currentTheme.colors.primary
                        : isActive
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'transparent',
                      paddingLeft: isExpanded ? 16 : 0,
                      justifyContent: isExpanded ? 'flex-start' : 'center',
                      transform: [{ scale: isFocused ? 1.02 : 1 }],
                    },
                  ]}
                >
                  {/* Active indicator */}
                  {isActive && !isFocused && (
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: currentTheme.colors.primary }
                      ]}
                    />
                  )}

                  <View style={styles.iconContainer}>
                    <Feather name={iconName as any} size={22} color={iconColor} />
                  </View>

                  {isExpanded && (
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isFocused ? '#000000' : iconColor,
                          fontWeight: isActive || isFocused ? '600' : '400',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {typeof label === 'string' ? label : route.name}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Version */}
        {isExpanded && (
          <View style={styles.bottomSection}>
            <Text style={styles.versionText}>v1.2.11</Text>
          </View>
        )}
      </Animated.View>
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  focusGuide: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  container: {
    flex: 1,
    paddingBottom: TV_SAFE_AREA.bottom + 20,
  },
  logoContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  navItems: {
    flex: 1,
    paddingHorizontal: 8,
  },
  itemTouchable: {
    marginVertical: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 2,
  },
  iconContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  bottomSection: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
  },
});

export default TVSidebar;
