import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera'; 
import { saveStructuredData, getCurrentLocation, VLOG_DIR } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy'; // [重要修復] 導入 legacy API

export default function VlogScreen() {
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [message, setMessage] = useState('');
    const cameraRef = useRef(null);

    // 檢查相機權限，使用解構出的 hook
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission || !permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>需要相機權限才能記錄 Vlog。</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>授予權限</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const startRecording = async () => {
        if (cameraRef.current && !isRecording) {
            setIsRecording(true);
            setHasRecorded(false);
            setMessage('正在錄製 1 秒 Vlog...');

            try {
                // 1. 開始錄製
                const options = {
                    quality: Camera.Constants.VideoQuality['480p'],
                    maxDuration: 1, // 限制最大錄製時間為 1 秒
                    mute: true,
                };

                // recordAsync 是同步調用，但內部錄製是異步的
                const video = await cameraRef.current.recordAsync(options);
                
                // 2. 獲取 GPS 座標 (即使失敗也會返回 null，不會中斷程序)
                const location = await getCurrentLocation();
                
                // 3. 命名並移動檔案
                const newPath = VLOG_DIR + `vlog_${Date.now()}.mp4`;
                await FileSystem.moveAsync({
                    from: video.uri,
                    to: newPath,
                });
                
                // 4. 儲存結構化數據
                await saveStructuredData(
                    'vlog', 
                    'recorded', 
                    newPath,
                    location
                );

                setMessage(`Vlog 儲存成功！路徑: ${newPath.substring(newPath.lastIndexOf('/') + 1)}`);
                setHasRecorded(true);

            } catch (error) {
                console.error("Vlog recording failed:", error);
                Alert.alert("錄製失敗", error.message || "無法完成 Vlog 錄製和儲存。");
                setMessage('錄製失敗！');
            } finally {
                setIsRecording(false);
                setTimeout(() => setMessage(''), 5000);
            }
        }
    };
    
    const stopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
            // setIsRecording 在 recordAsync promise 結束後才會設置為 false
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>一秒 Vlog 紀錄</Text>
            
            <Camera
                style={styles.camera}
                type={Camera.Constants.Type.front} // 通常Vlog使用前置鏡頭
                ref={cameraRef}
                ratio="16:9"
            >
                <View style={styles.overlay}>
                    <Text style={styles.overlayText}>保持微笑 😃</Text>
                    {isRecording && <Text style={styles.recordingIndicator}>🔴 REC 0:01</Text>}
                </View>
            </Camera>
            
            <TouchableOpacity
                style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isRecording && !hasRecorded} // 錄製中時，僅允許停止
            >
                <Ionicons 
                    name={isRecording ? "stop-circle-sharp" : "videocam-sharp"} 
                    size={40} 
                    color={isRecording ? "red" : "white"} 
                />
            </TouchableOpacity>
            
            {message ? (
                <View style={styles.messageBox}>
                    {isRecording && <ActivityIndicator size="small" color="#007AFF" />}
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            ) : null}
            
            <Text style={styles.noteText}>點擊開始錄製，App 將自動在 1 秒後停止並儲存。</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1E3A8A',
    },
    camera: {
        width: '90%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
    },
    overlayText: {
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 5,
    },
    recordingIndicator: {
        color: 'red',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 5,
        fontWeight: 'bold',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        borderWidth: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    captureButtonRecording: {
        backgroundColor: 'transparent',
        borderColor: 'red',
    },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    messageText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#007AFF',
    },
    noteText: {
        fontSize: 14,
        color: '#888',
        marginTop: 20,
        textAlign: 'center',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    permissionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#FF3B30',
        padding: 10,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});