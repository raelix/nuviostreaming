/**
 * TVSidebar Component
 * Collapsible sidebar for TV - shows icons when collapsed, expands on focus.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { TV_SAFE_AREA } from '../../utils/tvUtils';

// Sidebar dimensions
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 240;

interface TVSidebarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface SidebarItemProps {
  label: string;
  iconName: string;
  iconLibrary: 'feather' | 'ionicons';
  isActive: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onFocus: () => void;
  onBlur: () => void;
  hasTVPreferredFocus?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  iconName,
  iconLibrary,
  isActive,
  isExpanded,
  onPress,
  onFocus,
  onBlur,
  hasTVPreferredFocus,
}) => {
  const { currentTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.08 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isFocused, scaleAnim]);

  const iconColor = isActive ? currentTheme.colors.primary :
                    isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
  const iconSize = 24;

  const renderIcon = () => {
    const props = { name: iconName as any, size: iconSize, color: iconColor };
    if (iconLibrary === 'ionicons') {
      return <Ionicons {...props} />;
    }
    return <Feather {...props} />;
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  // TV-specific props
  const tvProps = {
    hasTVPreferredFocus,
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
            backgroundColor: isFocused
              ? currentTheme.colors.primary
              : isActive
                ? 'rgba(255, 255, 255, 0.1)'
                : 'transparent',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            paddingHorizontal: isExpanded ? 16 : 0,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        {isExpanded && (
          <Text
            style={[
              styles.label,
              {
                color: isFocused ? '#000' : iconColor,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;
  const collapseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
      useNativeDriver: false,
      friction: 12,
      tension: 100,
    }).start();
  }, [isExpanded, widthAnim]);

  const handleItemFocus = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setIsExpanded(true);
  }, []);

  const handleItemBlur = useCallback(() => {
    // Delay collapse to allow moving between items
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  }, []);

  useEffect(() => {
    return () => {
      if (collapseTimer.current) {
        clearTimeout(collapseTimer.current);
      }
    };
  }, []);

  const getIconInfo = (routeName: string): { name: string; library: 'feather' | 'ionicons' } => {
    switch (routeName) {
      case 'Home':
        return { name: 'home', library: 'feather' };
      case 'Library':
        return { name: 'heart', library: 'feather' };
      case 'Search':
        return { name: 'search', library: 'feather' };
      case 'Downloads':
        return { name: 'download', library: 'feather' };
      case 'Settings':
        return { name: 'settings', library: 'feather' };
      default:
        return { name: 'circle', library: 'feather' };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: widthAnim,
          paddingTop: TV_SAFE_AREA.top + 16,
        }
      ]}
    >
      {/* Background */}
      <LinearGradient
        colors={['rgba(15, 15, 15, 0.98)', 'rgba(15, 15, 15, 0.9)', 'rgba(15, 15, 15, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: currentTheme.colors.primary }]}>
          {isExpanded ? 'NUVIO' : 'N'}
        </Text>
      </View>

      {/* Nav Items */}
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
          const iconInfo = getIconInfo(route.name);

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
              iconName={iconInfo.name}
              iconLibrary={iconInfo.library}
              isActive={isActive}
              isExpanded={isExpanded}
              onPress={onPress}
              onFocus={handleItemFocus}
              onBlur={handleItemBlur}
              hasTVPreferredFocus={index === 0 && state.index === 0}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    paddingBottom: TV_SAFE_AREA.bottom + 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: EXPANDED_WIDTH + 60,
  },
  logoContainer: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
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
    borderRadius: 10,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
});

export default TVSidebar;
