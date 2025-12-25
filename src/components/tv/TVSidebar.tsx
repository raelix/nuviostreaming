/**
 * TVSidebar Component
 * A sidebar navigation component for TV interfaces.
 * Replaces bottom tab navigation with a vertical sidebar for D-pad navigation.
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { TV_DIMENSIONS, TV_FOCUS_BORDER_COLOR, TV_SAFE_AREA } from '../../utils/tvUtils';

interface TVSidebarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface SidebarItemProps {
  label: string;
  iconName: string;
  iconLibrary: 'material' | 'feather' | 'ionicons';
  isFocused: boolean;
  isActive: boolean;
  onPress: () => void;
  onFocus: () => void;
  hasTVPreferredFocus?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  iconName,
  iconLibrary,
  isFocused,
  isActive,
  onPress,
  onFocus,
  hasTVPreferredFocus,
}) => {
  const { currentTheme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: isFocused || isActive ? 1 : 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, isActive]);

  const iconColor = isActive || isFocused ? currentTheme.colors.primary : currentTheme.colors.white;
  const iconSize = 28;

  const renderIcon = () => {
    const props = { name: iconName as any, size: iconSize, color: iconColor };
    switch (iconLibrary) {
      case 'feather':
        return <Feather {...props} />;
      case 'ionicons':
        return <Ionicons {...props} />;
      default:
        return <MaterialCommunityIcons {...props} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={onFocus}
      activeOpacity={1}
      hasTVPreferredFocus={hasTVPreferredFocus}
      isTVSelectable={true}
      style={styles.itemTouchable}
    >
      <Animated.View
        style={[
          styles.item,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            backgroundColor: isFocused
              ? 'rgba(255, 255, 255, 0.15)'
              : isActive
                ? 'rgba(255, 255, 255, 0.08)'
                : 'transparent',
            borderLeftWidth: isActive ? 3 : 0,
            borderLeftColor: currentTheme.colors.primary,
          },
        ]}
      >
        {isFocused && (
          <View style={[styles.focusIndicator, { backgroundColor: currentTheme.colors.primary }]} />
        )}
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <Text
          style={[
            styles.label,
            {
              color: iconColor,
              fontWeight: isActive || isFocused ? '700' : '500',
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const TVSidebar: React.FC<TVSidebarProps> = ({ state, descriptors, navigation }) => {
  const { currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [focusedIndex, setFocusedIndex] = useState(state.index);

  const getIconInfo = (routeName: string): { name: string; library: 'material' | 'feather' | 'ionicons' } => {
    switch (routeName) {
      case 'Home':
        return { name: 'home', library: 'feather' };
      case 'Library':
        return { name: 'library', library: 'ionicons' };
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
    <View style={[styles.container, { paddingTop: TV_SAFE_AREA.top + 20 }]}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />

      {/* App Logo/Title */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: currentTheme.colors.primary }]}>
          NUVIO
        </Text>
      </View>

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
              isFocused={isFocused}
              isActive={isActive}
              onPress={onPress}
              onFocus={() => setFocusedIndex(index)}
              hasTVPreferredFocus={index === 0 && state.index === 0}
            />
          );
        })}
      </View>

      {/* Bottom section for version/info */}
      <View style={styles.bottomSection}>
        <Text style={styles.versionText}>v1.2.11</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TV_DIMENSIONS.SIDEBAR_WIDTH,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: TV_SAFE_AREA.bottom + 20,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: TV_DIMENSIONS.SIDEBAR_WIDTH + 50,
  },
  logoContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
  },
  navItems: {
    flex: 1,
  },
  itemTouchable: {
    marginVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  focusIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 4,
    borderRadius: 2,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  bottomSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    opacity: 0.5,
  },
  versionText: {
    color: '#888',
    fontSize: 14,
  },
});

export default TVSidebar;
