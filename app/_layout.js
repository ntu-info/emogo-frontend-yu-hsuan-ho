import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import { initializeApp } from '../lib/utils';
import { LogBox } from 'react-native';

// 忽略一個常見的 SQLite 警告，因為在某些情況下它不是真正的問題。
LogBox.ignoreLogs([
  'Setting a timer', // 忽略 setTimers 警告
]);

export default function RootLayout() {
  // 在應用程式啟動時執行初始化，設置權限、DB和通知。
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <>
      {/* Root stack controls screen transitions for the whole app */}
      <Stack>
        {/* The (tabs) group is one Stack screen with its own tab navigator */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        {/* This screen is pushed on top of tabs when you navigate to /details */}
        <Stack.Screen
          name="details"
          options={{ title: "Details" }}
        />
      </Stack>
    </>
  );
}