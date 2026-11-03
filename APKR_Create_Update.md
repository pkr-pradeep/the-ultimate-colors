---  
You:  
what I need to if I change something in source code, how to update APK
Agent:  
> Thought  
> **Clarifying Update Process**  
>   
> I'm focusing on clarifying how to update an APK when source code is changed in a Capacitor project. I'm considering the implications for React/TypeScript frontends built with Vite, along with the Android native shell integration.  
>   
>   
>   
Call: find_files(directory=C:/devl/the-ultimate-colors/android/app/build/outputs/apk, query=*.apk)
Response:
  Blocked by AI exclude policies: C:/devl/the-ultimate-colors/android/app/build/outputs/apk
Agent:  
Whenever you make changes to your frontend source code (TypeScript, React components, CSS, or web assets), follow these steps to update your APK:

### 1. Build & Sync
Run the following commands from your project root:
```bash
npm run build
npx cap sync android
```
*(This compiles your web code into the `dist/` folder and copies those assets into the Android project).*

### 2. Build the Debug APK
Navigate to the `android` folder and build the APK using Gradle:
```bash
cd android
./gradlew app:assembleDebug
```

---

### 💡 Convenient One-Liner
You can also run all steps in sequence from the project root:
```bash
npm run build && npx cap sync android && cd android && ./gradlew app:assembleDebug
```

### 📦 Where to Find Your APK
Once the build succeeds, your updated debug APK will be ready at:
`android/app/build/outputs/apk/debug/app-debug.apk`
