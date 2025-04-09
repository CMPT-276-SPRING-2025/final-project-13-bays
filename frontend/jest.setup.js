// Extend Jest with custom matchers for DOM testing
import '@testing-library/jest-dom';

// Polyfill TextEncoder and TextDecoder for compatibility
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock matchMedia API (if needed)
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  };
};