/**
 * TVSidebar Component
 * Modal Navigation Drawer pattern for TV using useTVEventHandler
 *
 * Key insight: Track focused item INDEX at sidebar level, not in each item.
 * This prevents multiple items showing as focused and avoids onBlur issues.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useTVEventHandler,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TV_SAFE_AREA } from '../../utils/tvUtils';

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
  isFocused: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onFocus: () => void;
  hasTVPreferredFocus: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  iconName,
  isActive,
  isFocused,
  isExpanded,
  onPress,
  onFocus,
  hasTVPreferredFocus,
}) => {
  const { currentTheme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: false,
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

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', currentTheme.colors.primary],
  });

  const iconColor = isFocused ? '#000000' : isActive ? currentTheme.colors.primary : 'rgba(255, 255, 255, 0.8)';
  const textColor = isFocused ? '#000000' : isActive ? currentTheme.colors.primary : 'rgba(255, 255, 255, 0.9)';

  const tvProps = {
    hasTVPreferredFocus,
    isTVSelectable: true,
  } as any;

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={onFocus}
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasFocus, setHasFocus] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(state.index); // Track which item is focused
  const widthAnim = useRef(new Animated.Value(EXPANDED_WIDTH)).current;
  const scrimAnim = useRef(new Animated.Value(1)).current;
  const hasFocusRef = useRef(true);

  useEffect(() => {
    hasFocusRef.current = hasFocus;
  }, [hasFocus]);

  // Listen for RIGHT press to collapse sidebar
  const tvEventHandler = useCallback((evt: any) => {
    const eventType = evt?.eventType;

    if (eventType === 'right' && hasFocusRef.current) {
      setHasFocus(false);
      setIsExpanded(false);
      setFocusedIndex(-1); // Clear focused index when leaving
    }
  }, []);

  useTVEventHandler(tvEventHandler);

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

  // Called when any item gets focus - expand sidebar and track which item
  const handleItemFocus = useCallback((index: number) => {
    setHasFocus(true);
    setIsExpanded(true);
    setFocusedIndex(index);
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
      <Animated.View
        style={[
          styles.scrim,
          { opacity: scrimOpacity },
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      />

      <Animated.View
        style={[
          styles.container,
          {
            width: widthAnim,
            paddingTop: TV_SAFE_AREA.top + 24,
            backgroundColor: isExpanded ? 'rgba(10, 10, 10, 0.98)' : 'rgba(20, 20, 20, 1)',
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: currentTheme.colors.primary }]}>
            {isExpanded ? 'NUVIO' : 'N'}
          </Text>
        </View>

        <View style={[styles.divider, { width: isExpanded ? '80%' : '60%' }]} />

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
            const isFocused = hasFocus && focusedIndex === index;

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
              <SidebarItem
                key={route.key}
                label={typeof label === 'string' ? label : route.name}
                iconName={getIconName(route.name)}
                isActive={isActive}
                isFocused={isFocused}
                isExpanded={isExpanded}
                onPress={onPress}
                onFocus={() => handleItemFocus(index)}
                hasTVPreferredFocus={hasFocus && index === state.index}
              />
            );
          })}
        </View>

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
