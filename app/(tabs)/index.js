import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Link } from "expo-router";
import { getNextCollectionTime } from '../../lib/utils';

export default function HomeScreen() {
  const [nextTime, setNextTime] = useState(null);

  useEffect(() => {
    // 載入下一次收集時間
    const updateNextTime = () => {
      const time = getNextCollectionTime();
      setNextTime(time);
    };
    
    updateNextTime(); // 立即更新
    const interval = setInterval(updateNextTime, 60000); // 每分鐘更新一次
    
    return () => clearInterval(interval);
  }, []);

  const formattedTime = nextTime 
    ? nextTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '計算中...';
    
  const formattedDate = nextTime 
    ? nextTime.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }) 
    : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emogo 數據收集狀態</Text>
      
      <Text style={styles.statusLabel}>
        下一次收集時間：
      </Text>
      <Text style={styles.statusTime}>
        {nextTime && nextTime.getDate() === new Date().getDate() ? '今天' : formattedDate} {formattedTime}
      </Text>
      
      <Text style={styles.note}>
        請留意 7:30,13:30,19:30 的通知，以完成數據收集。
      </Text>

      {/* 保持原有的導航連結，作為額外功能 */}
      <View style={styles.linkContainer}> 
        <Link href="/details" asChild>
            <Button title="查看 App 詳細資訊 (Details)" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  statusLabel: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  statusTime: {
    fontSize: 48,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 40,
  },
  note: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 50,
  },
  linkContainer: {
    marginTop: 30,
    width: '20%',
  }
});