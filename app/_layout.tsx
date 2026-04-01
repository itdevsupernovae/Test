import '../i18n';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { storage } from '../lib/storage';
import { initPurchases } from '../lib/purchases';
import { colors } from '../theme/colors';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    (async () => {
      // Load language preference
      const lang = await storage.getLanguage();
      await i18n.changeLanguage(lang);

      // Ensure account creation date is set
      const createdAt = await storage.getAccountCreatedAt();
      if (!createdAt) {
        await storage.setAccountCreatedAt(new Date().toISOString());
      }

      // Initialize RevenueCat
      await initPurchases();

      const done = await storage.isOnboardingComplete();
      setOnboardingDone(done);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        initialRouteName={onboardingDone ? '(tabs)' : 'onboarding/welcome'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/welcome"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="onboarding/pain-zones"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="onboarding/pain-level"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="onboarding/time-preference"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="onboarding/notifications"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="onboarding/commit"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="routine/exercise"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="routine/pain-check"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="routine/complete"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
