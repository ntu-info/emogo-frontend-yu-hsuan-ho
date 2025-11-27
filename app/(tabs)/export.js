import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, FlatList, Alert } from 'react-native';
import { exportData } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function ExportScreen() {
    const [isExporting, setIsExporting] = useState(false);
    
    // 雖然 utils.js 中的 exportData 已經會彈出分享對話框，
    // 但我們也可以在這裡加入一個簡單的預覽功能 (這裡僅顯示導出按鈕)

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const fileName = await exportData();
            if (fileName) {
                Alert.alert("匯出成功", `數據已匯出並準備分享！`);
            }
        } catch (error) {
            Alert.alert("匯出錯誤", "匯出數據時發生錯誤，請檢查權限和日誌。");
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Ionicons name="cloud-download-outline" size={80} color="#007AFF" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>數據匯出</Text>
            <Text style={styles.description}>
                點擊下方按鈕將所有情感分數、Vlog 記錄和 GPS 座標數據匯出為 CSV 格式的文件。
            </Text>
            
            <View style={styles.buttonContainer}>
                <Button
                    title={isExporting ? "匯出中..." : "匯出數據 (CSV)"}
                    onPress={handleExport}
                    disabled={isExporting}
                />
            </View>

            {isExporting && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>正在準備文件...</Text>
                </View>
            )}

            <Text style={styles.warningText}>
                注意：Vlog 檔案（MP4）不會直接包含在 CSV 中，但其路徑會記錄在 CSV 裡。
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 30,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1E3A8A',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        width: '70%',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 30,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#007AFF',
    },
    warningText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 40,
        paddingHorizontal: 15,
    }
});