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

### **3. Set up FLASK and Install Firebase & Required Dependencies**
Run the following commands **one by one** to install Firebase and other necessary libraries:

```sh
npx install-expo-modules@latest && npx expo start && npm install firebase -g firebase-tools @react-native-async-storage/async-storage expo-image-picker expo-constants react-native-dotenv
```

You'll need Python installed. If you don't have it, install Python (3.13 from Microsoft Store).

Create a Virtual Environment (venv)
Navigate to your project folder and run: python -m venv venv

The steps below must be repeated every time you start coding:

Run: venv\Scripts\activate (for Windows) or source venv/bin/activate (for Mac)

Install Flask and Dependencies in your venv
Inside your virtual environment, install Flask and necessary libraries: pip install -r requirements.txt
We put all required packages inside requirements.txt so the above line will install them

Finally, run the file app.py (THIS WILL START YOUR LOCAL FLASK SERVER)

# Input Flask Backend Firebase Key (Service Account JSON)

Create file named .env in root folder with
FIREBASE_CREDENTIALS=C:/Users/crazy/Downloads/rumble-swipeconnect-firebase-adminsdk-fbsvc-6923445e97.json (REPLACE STRING WITH LOCAL PATH TO PRIVATE FIREBASE KEY; no quotes, forward slashes for python string format)
Our flask files rely on your local .env file keys so that you only have to write your key down once
