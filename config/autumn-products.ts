export interface AutumnProduct {
  id: string;
  name: string;
  description?: string;
  type: 'service' | 'physical' | 'addon';
  display?: {
    name?: string;
    description?: string;
    recommend_text?: string;
    button_text?: string;
    button_url?: string;
    everything_from?: string;
  };
  properties?: {
    interval?: 'month' | 'year' | 'one_time';
    interval_group?: 'month' | 'year';
    is_free?: boolean;
  };
  items: Array<{
    id: string;
    type: 'flat' | 'unit' | 'tier';
    display?: {
      primary_text?: string;
      secondary_text?: string;
    };
    flat?: {
      amount: number;
    };
    unit?: {
      amount: number;
      quantity?: number;
    };
  }>;
}

export const AUTUMN_PRODUCTS: AutumnProduct[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Test GEO with basic features',
    type: 'service',
    display: {
      name: 'Free',
      description: 'Perfect to get started with GEO',
      button_text: 'Try for Free',
    },
    properties: {
      is_free: true,
    },
    items: [
      {
        id: 'free-analyses',
        type: 'unit',
        display: {
          primary_text: '5 analyses',
          secondary_text: 'per month',
        },
        unit: {
          amount: 0,
          quantity: 5,
        },
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For small brands or agencies',
    type: 'service',
    display: {
      name: 'Pro',
      description: 'More analyses, priority support',
      button_text: 'Start Pro',
      recommend_text: 'Best value',
    },
    properties: {
      interval: 'month',
      interval_group: 'month',
    },
    items: [
      {
        id: 'pro-price',
        type: 'flat',
        display: {
          primary_text: '$19',
          secondary_text: 'per month',
        },
        flat: {
          amount: 1900, // Amount in cents
        },
      },
      {
        id: 'pro-analyses',
        type: 'unit',
        display: {
          primary_text: '100 analyses',
          secondary_text: 'per month',
        },
        unit: {
          amount: 0,
          quantity: 100,
        },
      },
    ],
  },
];
