export * from 'expo-image-picker';

// Mock the `launchImageLibraryAsync` and `requestMediaLibraryPermissionsAsync` methods
export const launchImageLibraryAsync = jest.fn(() => 
  Promise.resolve({
    cancelled: false,
    assets: [{ uri: 'mocked-image-uri' }],
  })
);

export const requestMediaLibraryPermissionsAsync = jest.fn(() =>
  Promise.resolve({ granted: true })
);
