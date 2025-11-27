import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
// 導入 FileSystem 的舊版 (legacy) API
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Sharing from 'expo-sharing';
import { Camera } from 'expo-camera'; 
import { Platform } from 'react-native'; // <-- 導入 Platform

// --- 配置 ---
// 確保這些 URI 只在原生環境下有效
const VLOG_DIR = FileSystem.documentDirectory + 'vlogs/';
const DATA_FILE_URI = FileSystem.documentDirectory + 'emogo_log.json'; 
// [修改] 新的通知時間 (小時, 分鐘)
const COLLECTION_TIMES = [
    { hour: 7, minute: 30 }, 
    { hour: 13, minute: 30 }, 
    { hour: 19, minute: 30 }
]; 

// --- 時間工具：將時間轉換為 UTC+8 字符串 ---
// 數據將以 ISO 格式儲存，但我們希望它反映 UTC+8 的實際時間
const getLocalTimestamp = () => {
    // 獲取當前時間的 Date 物件
    const now = new Date();
    
    // 計算 UTC+8 的毫秒偏移量 (8小時 * 60分鐘 * 60秒 * 1000毫秒)
    const offset = 8 * 60 * 60 * 1000;
    
    // 獲取 UTC 時間的毫秒數，並加上 UTC+8 的偏移量
    const localTime = new Date(now.getTime() + offset);
    
    // 由於 Date.toISOString() 總是輸出 UTC 格式 (末尾帶 Z)，
    // 我們需要手動格式化或使用一個不帶時區信息的字符串
    // 這裡我們直接使用 Date.now()，但在儲存前先格式化為 UTC+8 的 ISO 樣式 (不帶 Z)
    
    // 由於要確保兼容性，我們直接返回一個反映 UTC+8 實際時間的 ISO-like 字符串
    // 這裡使用臺灣時間的字串格式化 (不會在 Web/Android 上自動轉換，確保記錄 UTC+8 的實際時間)
    return now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei'
    }).replace(/\//g, '-').replace(/, /g, 'T').replace(/ /g, '');
};

// --- 檔案系統助手 ---
// 讀取所有數據
const loadData = async () => {
    if (Platform.OS === 'web') return []; // Web 不讀寫文件
    try {
        const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_URI);
        return JSON.parse(fileContent);
    } catch (e) {
        // 如果文件不存在或解析失敗，返回空陣列
        return [];
    }
};

// 寫入所有數據 (覆蓋原文件)
const saveAllData = async (dataArray) => {
    if (Platform.OS === 'web') return; // Web 不寫入文件
    await FileSystem.writeAsStringAsync(DATA_FILE_URI, JSON.stringify(dataArray, null, 2));
};

// 確保Vlog目錄存在
export const setupVlogDirectory = async () => {
    if (Platform.OS === 'web') return; // Web 跳過
    try {
        const dirInfo = await FileSystem.getInfoAsync(VLOG_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(VLOG_DIR, { intermediates: true });
            console.log('Vlog directory created:', VLOG_DIR);
        }
    } catch (error) {
        console.error('Failed to set up Vlog directory:', error);
    }
};

// --- 權限與初始化 ---
export const initializeApp = async () => {
    // 1. 請求所有權限
    await requestPermissions();
    
    if (Platform.OS !== 'web') { // 只有在原生環境才執行文件操作和通知排程
        // 2. 初始化資料文件
        await initDatabase(); 
        // 3. 設定Vlog目錄
        await setupVlogDirectory();
        // 4. 排程通知
        await scheduleDailyNotifications();
    }
    
    console.log('App initialization complete.');
};

const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
        // 通知權限
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        console.log('Notification permission status:', notifStatus);

        // 位置權限 (前景)
        let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
            console.error('Permission to access foreground location was denied');
        }
        
        // 背景位置權限
        let { status: backgroundLocationStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundLocationStatus !== 'granted') {
            console.warn('Permission to access background location was denied. GPS will only be collected when the app is active.');
        }

        // 相機權限
        let { status: cameraStatus } = await Camera.requestCameraPermissionsAsync(); 
        if (cameraStatus !== 'granted') {
            console.error('Permission to access camera was denied');
        }
    }
};

// 檔案系統的初始化：檢查 JSON 數據文件是否存在，如果不存在則創建一個空陣列
const initDatabase = async () => {
    // 已經在 initializeApp 中檢查了 Platform.OS !== 'web'
    try {
        const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_URI);
        if (!fileInfo.exists) {
            await saveAllData([]); 
            console.log('Data log file initialized.');
        } else {
            console.log('Data log file already exists.');
        }
    } catch (error) {
        console.error('Failed to initialize data log file:', error);
    }
};

// --- 資料儲存 (JSON 檔案系統操作) ---
export const saveStructuredData = async (type, value, vlogPath = null, location = null) => {
    if (Platform.OS === 'web') {
        console.warn('數據未儲存：Web 環境不支持文件系統操作。');
        return;
    }

    // [修改] 使用 UTC+8 的時間戳記
    const timestamp = getLocalTimestamp();
    
    const newDataEntry = {
        id: Date.now(), 
        timestamp, // UTC+8 時間字符串
        type, 
        value, 
        vlog_path: vlogPath,
        lat: location ? location.coords.latitude : null,
        lng: location ? location.coords.longitude : null,
    };
    
    try {
        let existingData = await loadData();
        existingData.push(newDataEntry);
        await saveAllData(existingData);

        console.log(`Data saved to JSON: ${type} - ${value}`);
        return newDataEntry.id;

    } catch (error) {
        // 儲存失敗時拋出錯誤，讓呼叫者 (如 settings.js) 捕獲並顯示
        console.error('Failed to save data to JSON file:', error);
        throw new Error(`無法寫入數據文件: ${error.message}`);
    }
};

// --- GPS 收集 ---
export const getCurrentLocation = async () => {
    if (Platform.OS === 'web') return null; // Web 跳過 GPS 收集
    try {
        let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
        });
        return location;
    } catch (e) {
        console.warn("Error getting location: GPS collection failed.", e);
        return null; 
    }
};

// --- 通知排程 ---
const scheduleDailyNotifications = async () => {
    // 已經在 initializeApp 中檢查了 Platform.OS !== 'web'
    await Notifications.cancelAllScheduledNotificationsAsync(); 

    for (const { hour, minute } of COLLECTION_TIMES) { // [修改] 解構 hour 和 minute
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Emogo 數據收集時間到了！",
                body: `請花一秒鐘記錄你的心情和Vlog (${hour}:${minute.toString().padStart(2, '0')})。`,
                data: { hour: hour, minute: minute },
            },
            trigger: {
                hour: hour,
                minute: minute, // [修改] 使用分鐘數
                repeats: true, 
            },
        });
        console.log(`Notification scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
    }
};

export const getNextCollectionTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 尋找下一個排程時間
    let nextCollection = COLLECTION_TIMES.find(time => {
        if (time.hour > currentHour) return true;
        if (time.hour === currentHour && time.minute > currentMinute) return true;
        return false;
    });

    let nextTime = new Date(now);

    if (!nextCollection) {
        // 如果今天沒有了，則取明天第一個時間點 (07:30)
        nextCollection = COLLECTION_TIMES[0];
        nextTime.setDate(nextTime.getDate() + 1);
    }
    
    // 設定下一個時間點
    nextTime.setHours(nextCollection.hour, nextCollection.minute, 0, 0);
    return nextTime;
};

// --- 資料匯出 (JSON 轉 CSV) ---
export const exportData = async () => {
    if (Platform.OS === 'web') {
        alert('Web 環境不支持數據匯出。');
        return null;
    }
    
    try {
        const rows = await loadData(); 
        
        if (rows.length === 0) {
            alert('沒有數據可匯出！');
            return null;
        }

        const header = "id,timestamp,type,value,vlog_path,lat,lng\n";
        const csvContent = rows.map(row => 
            // 確保所有字段都被正確引號包裹，以處理 CSV 內部逗號或特殊字元
            `${row.id},"${row.timestamp}","${row.type}","${row.value}",${row.vlog_path ? `"${row.vlog_path}"` : ""},${row.lat || ""},${row.lng || ""}`
        ).join('\n');
        
        const fullCsv = header + csvContent;

        const fileName = FileSystem.cacheDirectory + 'emogo_data_' + Date.now() + '.csv';
        await FileSystem.writeAsStringAsync(fileName, fullCsv);

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(fileName, {
                mimeType: 'text/csv',
                dialogTitle: '匯出 Emogo 數據',
            });
            return fileName;
        } else {
            alert('分享功能不可用，請檢查您的裝置。');
            return null;
        }
    } catch (error) {
        console.error('Failed to export data:', error);
        throw new Error('數據匯出失敗。');
    }
};