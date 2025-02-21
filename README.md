## **Setting Up Expo & Firebase for React Native**
Follow these steps to **set up Expo, Firebase, and required dependencies** in your React Native project.

---

### **1. Install Expo Modules**
Run the following command to ensure all Expo modules are up to date:
```sh
npx install-expo-modules@latest
```

---

### **2. Start Your Expo Project**
Start the Expo development server:
```sh
npx expo start
```

**If you don’t have Xcode:**
- Press **`w`** in the terminal to open the app in your browser.  
  - In the browser, set the **Inspector to iPhone mode** (Right-click → **Inspect → Toggle Device Toolbar**).
- **Want to use your iPhone?**  
  - **Scan the QR code** shown in the terminal using your Expo Go app.

---

### **3. Install Firebase & Required Dependencies**
Run the following commands **one by one** to install Firebase and other necessary libraries:

```sh
npx install-expo-modules@latest && npx expo start && npm install firebase -g firebase-tools @react-native-async-storage/async-storage expo-image-picker expo-constants react-native-dotenv
```
