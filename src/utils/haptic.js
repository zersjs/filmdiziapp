/**
 * Haptic Feedback Utility
 * Provides haptic-like feedback for touch devices and visual feedback for all
 */

// Check if device supports vibration
const supportsVibration = () => {
  return 'vibrate' in navigator;
};

// Haptic feedback types
export const HapticType = {
  LIGHT: 'light',
  MEDIUM: 'medium', 
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SELECTION: 'selection'
};

// Vibration patterns (in milliseconds)
const vibrationPatterns = {
  [HapticType.LIGHT]: [10],
  [HapticType.MEDIUM]: [20],
  [HapticType.HEAVY]: [30],
  [HapticType.SUCCESS]: [10, 50, 20],
  [HapticType.WARNING]: [20, 30, 20],
  [HapticType.ERROR]: [30, 50, 30, 50, 30],
  [HapticType.SELECTION]: [5]
};

// Visual feedback class names
const visualFeedbackClasses = {
  [HapticType.LIGHT]: 'haptic-light',
  [HapticType.MEDIUM]: 'haptic-medium',
  [HapticType.HEAVY]: 'haptic-heavy',
  [HapticType.SUCCESS]: 'haptic-success',
  [HapticType.WARNING]: 'haptic-warning',
  [HapticType.ERROR]: 'haptic-error',
  [HapticType.SELECTION]: 'haptic-selection'
};

/**
 * Trigger haptic feedback
 * @param {string} type - Type of haptic feedback
 * @param {HTMLElement} element - Optional element for visual feedback
 */
export const triggerHaptic = (type = HapticType.LIGHT, element = null) => {
  // Vibration feedback for supported devices
  if (supportsVibration()) {
    try {
      navigator.vibrate(vibrationPatterns[type] || vibrationPatterns[HapticType.LIGHT]);
    } catch (e) {
      // Silently fail if vibration doesn't work
    }
  }

  // Visual feedback - add class to element or body
  const targetElement = element || document.body;
  const className = visualFeedbackClasses[type] || 'haptic-light';
  
  targetElement.classList.add('haptic-feedback', className);
  
  // Remove classes after animation
  const duration = type === HapticType.ERROR ? 300 : 150;
  setTimeout(() => {
    targetElement.classList.remove('haptic-feedback', className);
  }, duration);
};

/**
 * Trigger haptic on click/touch
 * @param {Event} event 
 * @param {string} type 
 */
export const hapticOnInteraction = (event, type = HapticType.SELECTION) => {
  const element = event?.currentTarget || event?.target;
  triggerHaptic(type, element);
};

/**
 * Create a wrapped onClick handler with haptic feedback
 * @param {Function} handler - Original click handler
 * @param {string} type - Haptic type
 */
export const withHaptic = (handler, type = HapticType.SELECTION) => {
  return (event) => {
    triggerHaptic(type, event?.currentTarget);
    if (handler) {
      handler(event);
    }
  };
};

/**
 * React hook for haptic feedback
 */
export const useHaptic = () => {
  return {
    light: (element) => triggerHaptic(HapticType.LIGHT, element),
    medium: (element) => triggerHaptic(HapticType.MEDIUM, element),
    heavy: (element) => triggerHaptic(HapticType.HEAVY, element),
    success: (element) => triggerHaptic(HapticType.SUCCESS, element),
    warning: (element) => triggerHaptic(HapticType.WARNING, element),
    error: (element) => triggerHaptic(HapticType.ERROR, element),
    selection: (element) => triggerHaptic(HapticType.SELECTION, element),
    trigger: triggerHaptic
  };
};

export default {
  triggerHaptic,
  hapticOnInteraction,
  withHaptic,
  useHaptic,
  HapticType
};
