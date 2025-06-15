import { I18nManager, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type StyleProp = ViewStyle | TextStyle | ImageStyle;

/**
 * Applies LTR or RTL specific styles.
 * @param ltrStyle Style for Left-To-Right layout
 * @param rtlStyle Style for Right-To-Left layout (optional, will use ltrStyle if not provided)
 * @returns The appropriate style based on current I18nManager.isRTL
 */
export const getRTLStyle = (ltrStyle: StyleProp, rtlStyle?: StyleProp): StyleProp => {
  return I18nManager.isRTL && rtlStyle ? rtlStyle : ltrStyle;
};

/**
 * Returns a flex direction property.
 * @param row Whether the flex direction is row (default: 'row') or column ('column').
 * @returns 'row' or 'row-reverse' based on RTL.
 */
export const getFlexDirection = (type: 'row' | 'column' = 'row'): 'row' | 'row-reverse' | 'column' => {
  if (type === 'column') return 'column';
  return I18nManager.isRTL ? 'row-reverse' : 'row';
};

/**
 * Returns appropriate text alignment.
 * @returns 'left' for LTR, 'right' for RTL.
 */
export const getTextAlign = (): 'left' | 'right' => {
  return I18nManager.isRTL ? 'right' : 'left';
};

/**
 * Applies start/end (left/right) padding/margin based on RTL.
 * @param value The numerical value for padding/margin.
 * @returns An object with padding/marginStart and padding/marginEnd.
 */
export const getStartEndPadding = (value: number) => ({
  paddingStart: value, // maps to paddingLeft/paddingRight based on direction
  paddingEnd: value,   // maps to paddingRight/paddingLeft based on direction
});

export const getStartEndMargin = (value: number) => ({
  marginStart: value,
  marginEnd: value,
});

// Example for positioning icons
export const getAbsolutePosition = (key: 'left' | 'right', value: number) => {
  if (I18nManager.isRTL) {
    return key === 'left' ? { right: value } : { left: value };
  } else {
    return { [key]: value };
  }
}; 