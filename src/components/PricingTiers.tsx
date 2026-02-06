import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Check, Zap, Sparkles } from 'lucide-react';
import { UserTier, TIER_PRICES, TIER_LIMITS } from '@/lib/utils';

interface PricingTiersProps {
  currentTier: UserTier;
  onUpgrade: (tier: 'pro' | 'max') => void;
}

export function PricingTiers({ currentTier, onUpgrade }: PricingTiersProps) {
  const tiers = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying it out',
      features: [
        '15 images per month',
        'GPT-4o Mini model',
        'Standard response speed',
        'Basic accuracy',
      ],
      tier: 'free' as const,
      icon: null,
    },
    {
      name: 'Pro',
      price: TIER_PRICES.pro,
      description: 'For power users',
      features: [
        '50 images per month',
        'GPT-4o model',
        'Fast response speed',
        'High accuracy',
        'Priority support',
      ],
      tier: 'pro' as const,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      name: 'Max',
      price: TIER_PRICES.max,
      description: 'Ultimate intelligence',
      features: [
        'Unlimited images',
        'GPT-4o with extended thinking',
        'Fastest response speed',
        'Maximum accuracy',
        'Priority support',
        'Advanced analysis',
      ],
      tier: 'max' as const,
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
      {tiers.map((tier) => (
        <Card
          key={tier.tier}
          className={cn(
            'flex flex-col',
            tier.tier === 'max' && 'ring-2 ring-purple-500 md:scale-105',
            currentTier === tier.tier && 'ring-2 ring-primary'
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {tier.icon}
              <CardTitle className="text-xl">{tier.name}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{tier.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">${tier.price}</span>
              {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === tier.tier ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : tier.tier === 'free' ? (
              <Button variant="outline" className="w-full" disabled>
                Free Plan
              </Button>
            ) : (
              <Button
                variant="premium"
                className="w-full"
                onClick={() => onUpgrade(tier.tier as 'pro' | 'max')}
              >
                Upgrade to {tier.name}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
