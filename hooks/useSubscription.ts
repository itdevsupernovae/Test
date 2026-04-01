import { useState, useEffect, useCallback } from 'react';
import { getCustomerInfo, isPremium } from '../lib/purchases';
import { storage } from '../lib/storage';

const TRIAL_DAYS = 5;

export function useSubscription() {
  const [premium, setPremium] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(TRIAL_DAYS);
  const [paywallRequired, setPaywallRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [customerInfo, createdAt] = await Promise.all([
      getCustomerInfo(),
      storage.getAccountCreatedAt(),
    ]);

    const isUserPremium = isPremium(customerInfo);
    setPremium(isUserPremium);

    if (!isUserPremium) {
      const created = createdAt ? new Date(createdAt) : new Date();
      const daysSince = Math.floor(
        (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
      );
      const remaining = Math.max(0, TRIAL_DAYS - daysSince);
      setTrialDaysRemaining(remaining);
      setPaywallRequired(daysSince >= TRIAL_DAYS);
    } else {
      setTrialDaysRemaining(0);
      setPaywallRequired(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { isPremium: premium, trialDaysRemaining, paywallRequired, loading, reload: load };
}
