import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from "react-native";
import { saveStructuredData, getCurrentLocation } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function SentimentScreen() {
  const [moodScore, setMoodScore] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const scores = [1, 2, 3, 4, 5];

  const handleSubmit = async () => {
    if (moodScore === null) {
      Alert.alert("請先選擇一個分數！");
      return;
    }

    setIsSaving(true);
    setMessage('正在收集 GPS 並儲存數據...');
    
    try {
      // 1. 獲取 GPS 座標 (即使失敗也會返回 null)
      const location = await getCurrentLocation();
      
      // 2. 儲存結構化數據 (心情分數 + GPS)
      await saveStructuredData(
        'sentiment', 
        moodScore.toString(), 
        null, // 沒有vlog path
        location
      );

      // 3. 顯示成功訊息
      setMessage(`數據儲存成功！分數: ${moodScore}，GPS: ${location ? '已記錄' : '未記錄'}`);
      setMoodScore(null); // 清空分數
      
    } catch (error) {
      console.error("Sentiment submission failed:", error);
      // 顯示更詳細的錯誤，特別是文件系統寫入失敗
      Alert.alert("儲存失敗", `數據未能成功寫入文件系統：${error.message}`);
      setMessage('儲存失敗！請查看控制台日誌。');
    } finally {
      setIsSaving(false);
      // 自動清除成功訊息
      setTimeout(() => {
          if (message.startsWith('數據儲存成功')) {
              setMessage('');
          }
      }, 5000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>情感問卷</Text>
      <Text style={styles.question}>你今天心情如何？(1~5分)</Text>
      
      {/* 評分選項 */}
      <View style={styles.scoreContainer}>
        {scores.map((score) => (
          <TouchableOpacity
            key={score}
            style={[
              styles.scoreButton,
              moodScore === score && styles.scoreButtonSelected,
            ]}
            onPress={() => setMoodScore(score)}
            disabled={isSaving}
          >
            <Text
              style={[
                styles.scoreText,
                moodScore === score && styles.scoreTextSelected,
              ]}
            >
              {score}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.noteText}>
        <Ionicons name="sad-outline" size={16} color="#333" /> 1 = 非常不好, 5 = 非常好 <Ionicons name="happy-outline" size={16} color="#333" />
      </Text>

      <View style={styles.submitButtonContainer}>
        <Button 
          title={isSaving ? "儲存中..." : "提交數據"} 
          onPress={handleSubmit} 
          disabled={isSaving || moodScore === null}
        />
      </View>
      
      {message ? <Text style={[styles.messageText, message.startsWith('儲存失敗') && styles.errorText]}>{message}</Text> : null}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E3A8A',
  },
  question: {
    fontSize: 18,
    marginBottom: 40,
    color: '#333',
  },
  scoreContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 15,
  },
  scoreButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  scoreButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  scoreText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '700',
  },
  scoreTextSelected: {
    color: '#fff',
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonContainer: {
    width: '60%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageText: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  }
});