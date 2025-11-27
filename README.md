# Emogo 數據收集APP
這是一個應用程式，定時收集用戶的心情分數和影片紀錄以及當下GPS座標。

#### ⬇️ 點擊此連結以安裝於Android裝置 ⬇️
https://expo.dev/accounts/yuhsuanho/projects/emogo-data-collector/builds/52e9fdb5-ec1f-4a30-86f2-ee319bde5485

## ✨ 核心功能
* 定時提醒： 每日 07:30, 13:30, 19:30 發送通知，提醒用戶記錄。
* 數據收集： 收集心情分數 (1-5 分)、1秒影片紀錄(開發問題尚不支援此功能)、當前GPS座標。
* 儲存與匯出： 數據儲存在本地JSON文件中，支援匯出為CSV格式。

## 🛠️ 主要技術
本應用程式基於 **Expo Router** 並使用以下套件：
* expo-notifications：排程通知。
* expo-location：獲取 GPS 座標。
* expo-camera：錄製 Vlog。
* expo-file-system/legacy：數據持久化。
* expo-sharing：匯出數據。

## 🚀 運行指南

#### 💻 本地環境啟動步驟
1. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

2. Start the dev server:

   ```bash
   npx expo start --tunnel
   ```

3. Open the app on a device or emulator using the Expo dev tools.
