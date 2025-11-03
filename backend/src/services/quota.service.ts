import { firestore } from "../config/firebase";

const PLANS = {
  freemium: 20,
  basic: 50,
  pro: 200,
  elite: 500
} as const;

type PlanKey = keyof typeof PLANS;

export const getUserTier = async (uid: string): Promise<PlanKey> => {
  const doc = await firestore.collection("subscriptions").doc(uid).get();
  const tier = doc.data()?.tier as PlanKey | undefined;
  return tier ?? "freemium";
};

export const incrementUsage = async (uid: string) => {
  const tier = await getUserTier(uid);
  const limit = PLANS[tier];
  const monthKey = new Date().toISOString().slice(0, 7);
  const usageRef = firestore.collection("usage").doc(`${uid}_${monthKey}`);
  const snapshot = await usageRef.get();
  const count = snapshot.data()?.count ?? 0;

  if (count >= limit) {
    throw new Error("quota_exceeded");
  }

  await usageRef.set(
    {
      uid,
      month: monthKey,
      count: count + 1,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  return {
    tier,
    remaining: limit - (count + 1),
    limit
  };
};

export const getUsageStatus = async (uid: string) => {
  const tier = await getUserTier(uid);
  const limit = PLANS[tier];
  const monthKey = new Date().toISOString().slice(0, 7);
  const usageRef = firestore.collection("usage").doc(`${uid}_${monthKey}`);
  const snapshot = await usageRef.get();
  const count = snapshot.data()?.count ?? 0;

  return {
    tier,
    requestsRemaining: Math.max(limit - count, 0),
    requestsLimit: limit,
    renewalDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
  };
};
