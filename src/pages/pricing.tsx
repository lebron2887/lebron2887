import { PricingTiers } from '@/components/PricingTiers';
import { Button } from '@/components/Button';
import { getUserData, saveUserData, upgradeTier } from '@/lib/storage';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Pricing() {
  const [userData, setUserData] = useState(getUserData());
  const [, setLocation] = useLocation();

  const handleUpgrade = (tier: 'pro' | 'max') => {
    // In a real app, this would redirect to Stripe checkout
    // For now, we'll simulate the upgrade
    upgradeTier(tier);
    setUserData(getUserData());
    alert(`Upgraded to ${tier.toUpperCase()}!`);
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Unlock the full power of AI with premium tiers
          </p>
        </div>

        <PricingTiers currentTier={userData.tier} onUpgrade={handleUpgrade} />

        <div className="text-center mt-12">
          <Button onClick={() => setLocation('/')}>Back to Chat</Button>
        </div>
      </div>
    </div>
  );
}
