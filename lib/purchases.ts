import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const IOS_KEY =
  (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS as string) ?? 'placeholder_ios_key';
const ANDROID_KEY =
  (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID as string) ?? 'placeholder_android_key';

export async function initPurchases(): Promise<void> {
  try {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
    await Purchases.configure({ apiKey });
  } catch {
    // RevenueCat unavailable in dev without valid key
  }
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch {
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch {
    return null;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.restorePurchases();
  } catch {
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export function isPremium(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return (
    typeof customerInfo.entitlements.active['premium'] !== 'undefined'
  );
}
