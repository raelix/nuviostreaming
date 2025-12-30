/**
 * TVSidebar Component
 * Modal Navigation Drawer pattern for TV:
 * - Expanded: Overlays content with scrim when focused
 * - Collapsed: Icon-only rail in background when focus is on content
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TV_SAFE_AREA } from '../../utils/tvUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sidebar dimensions
const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 280;

interface TVSidebarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface SidebarItemProps {
  label: string;
  iconName: string;
  isActive: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onFocus: () => void;
  onBlur: () => void;
  index: number;
  activeIndex: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  iconName,
  isActive,
  isExpanded,
  onPress,
  onFocus,
  onBlur,
  index,
  activeIndex,
}) => {
  const { currentTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.timing(bgAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused, scaleAnim, bgAnim]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', currentTheme.colors.primary],
  });

  const iconColor = isFocused ? '#000000' : isActive ? currentTheme.colors.primary : 'rgba(255, 255, 255, 0.8)';
  const textColor = isFocused ? '#000000' : isActive ? currentTheme.colors.primary : 'rgba(255, 255, 255, 0.9)';

  // TV-specific props
  const tvProps = {
    hasTVPreferredFocus: index === activeIndex,
    isTVSelectable: true,
  } as any;

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      activeOpacity={1}
      style={styles.itemTouchable}
      {...tvProps}
    >
      <Animated.View
        style={[
          styles.item,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor,
            paddingLeft: isExpanded ? 20 : 0,
            justifyContent: isExpanded ? 'flex-start' : 'center',
          },
        ]}
      >
        {/* Active indicator line */}
        {isActive && !isFocused && (
          <View style={[styles.activeIndicator, { backgroundColor: currentTheme.colors.primary }]} />
        )}

        <View style={styles.iconContainer}>
          <Feather name={iconName as any} size={22} color={iconColor} />
        </View>

        {isExpanded && (
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontWeight: isActive || isFocused ? '600' : '400',
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const TVSidebar: React.FC<TVSidebarProps> = ({ state, descriptors, navigation }) => {
  const { currentTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded
  const [hasSidebarFocus, setHasSidebarFocus] = useState(true); // Start with focus
  const widthAnim = useRef(new Animated.Value(EXPANDED_WIDTH)).current;
  const scrimAnim = useRef(new Animated.Value(1)).current;
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(widthAnim, {
        toValue: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        useNativeDriver: false,
        friction: 12,
        tension: 80,
      }),
      Animated.timing(scrimAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded, widthAnim, scrimAnim]);

  const handleItemFocus = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setHasSidebarFocus(true);
    setIsExpanded(true);
  }, []);

  const handleItemBlur = useCallback(() => {
    // Delay to allow focus to move between sidebar items
    collapseTimer.current = setTimeout(() => {
      setHasSidebarFocus(false);
      setIsExpanded(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (collapseTimer.current) {
        clearTimeout(collapseTimer.current);
      }
    };
  }, []);

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

  const scrimOpacity = scrimAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });

  return (
    <>
      {/* Scrim overlay behind expanded sidebar */}
      <Animated.View
        style={[
          styles.scrim,
          { opacity: scrimOpacity },
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      />

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.container,
          {
            width: widthAnim,
            paddingTop: TV_SAFE_AREA.top + 24,
            backgroundColor: isExpanded ? 'rgba(10, 10, 10, 0.98)' : 'rgba(15, 15, 15, 0.95)',
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
        <View style={[styles.divider, { width: isExpanded ? '80%' : '60%' }]} />

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

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
              // Keep sidebar focused after navigation
            };

            return (
              <SidebarItem
                key={route.key}
                label={typeof label === 'string' ? label : route.name}
                iconName={getIconName(route.name)}
                isActive={isActive}
                isExpanded={isExpanded}
                onPress={onPress}
                onFocus={handleItemFocus}
                onBlur={handleItemBlur}
                index={index}
                activeIndex={state.index}
              />
            );
          })}
        </View>

        {/* Bottom info */}
        {isExpanded && (
          <View style={styles.bottomSection}>
            <Text style={styles.versionText}>v1.2.11</Text>
          </View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 99,
  },
  container: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    paddingBottom: TV_SAFE_AREA.bottom + 24,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  navItems: {
    flex: 1,
    paddingHorizontal: 12,
  },
  itemTouchable: {
    marginVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
  },
  iconContainer: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  bottomSection: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
});

export default TVSidebar;
