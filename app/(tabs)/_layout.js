import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // 使用 Ionicons 作為圖標

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#007AFF', // 藍色主題色
        headerTitleAlign: 'center',
    }}>
      {/* 狀態 / Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "狀態",
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
        }}
      />
      
      {/* 情感問卷 Tab (原 settings.js) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "心情問卷",
          tabBarIcon: ({ color }) => <Ionicons name="happy" color={color} size={24} />,
        }}
      />

      {/* Vlog 錄製 Tab (新增) */}
      <Tabs.Screen
        name="vlog"
        options={{
          title: "1秒Vlog",
          tabBarIcon: ({ color }) => <Ionicons name="camera" color={color} size={24} />,
        }}
      />
      
      {/* 資料匯出 Tab (新增) */}
      <Tabs.Screen
        name="export"
        options={{
          title: "數據匯出",
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}