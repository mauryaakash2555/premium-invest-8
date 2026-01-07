import { PieChart, TrendingUp, CreditCard, Shield, DollarSign, Repeat } from 'lucide-react';

// IMPORTANT:
// Put the Mutual Funds photo at: public/services/mutual-funds.png
// Then reference it via: /services/mutual-funds.png
const MUTUAL_FUNDS_IMAGE = '/services/mutual-funds.png';

const SERVICES = [
  {
    key: 'portfolio-management',
    Icon: TrendingUp,
    homeTitle: 'Portfolio Management',
    servicesTitle: 'Portfolio Management Services (PMS)',
    homeDescription: 'Portfolio planning, allocation frameworks, and periodic review.',
    servicesDescription:
      'Personalized wealth management strategies designed around your goals and risk profile. Our PMS offerings combine market research, active portfolio oversight, and disciplined processes to help you pursue long-term outcomes.',
    features: [
      'Customized investment strategies',
      'Dedicated portfolio manager',
      'Active fund management',
      'Regular performance reviews',
      'Direct equity investments',
    ],
    image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
    link: '/portfolio-management',
  },
  {
    key: 'mutual-funds',
    Icon: PieChart,
    homeTitle: 'Mutual Funds',
    servicesTitle: 'Mutual Funds',
    homeDescription: 'Mutual fund selection support, execution, and disciplined review cadence.',
    servicesDescription:
      'Explore a wide range of mutual fund schemes aligned to your goals and risk comfort. We help you understand options using performance insights, costs, and portfolio check-ins so you can make informed decisions.',
    features: [
      'Diversified fund selection',
      'Performance tracking and analysis',
      'Risk-adjusted returns',
      'Regular portfolio rebalancing',
      'Tax-efficient investing',
    ],
    image: MUTUAL_FUNDS_IMAGE,
    imagePresentation: {
      quality: 90,
    },
    link: '/mutual-funds',
  },
  {
    key: 'insurance',
    Icon: Shield,
    homeTitle: 'Insurance',
    servicesTitle: 'Insurance',
    homeDescription: 'Insurance comparisons, documentation support, and claims-ready guidance.',
    servicesDescription:
      'Insurance solutions to protect you and your loved ones. From life insurance to health coverage, we help you compare options clearly so you can choose coverage that fits your needs.',
    features: [
      'Life insurance policies',
      'Health insurance plans',
      'Term insurance coverage',
      'Policy comparison and analysis',
      'Claims assistance',
    ],
    image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?w=800&h=500&fit=crop&auto-compress&fm=webp&q=75',
    link: '/insurance',
  },
  {
    key: 'sip',
    Icon: Repeat,
    homeTitle: 'SIP',
    servicesTitle: 'Systematic Investment Plans (SIP)',
    homeDescription: 'Systematic Investment Plans for disciplined and goal-oriented investing.',
    servicesDescription:
      'Accumulate wealth systematically through disciplined monthly investments. SIPs empower you to benefit from rupee cost averaging and the power of compounding to achieve your long-term financial goals.',
    features: [
      'Disciplined investing approach',
      'Rupee cost averaging benefits',
      'Flexible investment amounts',
      'Auto-debit facility',
      'Goal-based planning',
    ],
    image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=800&h=500&fit=crop&auto-compress&fm=webp&q=75',
    link: '/sip',
  },
  {
    key: 'trading-services',
    Icon: CreditCard,
    homeTitle: 'Trading Services',
    servicesTitle: 'Trading Services',
    homeDescription: 'Demat onboarding, platform selection support, and execution framework.',
    servicesDescription:
      'Access market data, trading tools, and resources for equity, derivatives, and commodities. We focus on platform support and market insights, while you stay in control of every trade.',
    features: [
      'Real-time market access',
      'Advanced charting tools',
      'Research insights and resources',
      'Brokerage comparisons',
      'Expert trading support',
    ],
    image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
    link: '/trading-services',
  },
  {
    key: 'fixed-deposits',
    Icon: DollarSign,
    homeTitle: 'Fixed Deposits',
    servicesTitle: 'Fixed Deposits (FD)',
    homeDescription: 'Fixed deposit comparisons across tenure, payout options, and liquidity.',
    servicesDescription:
      'Seek predictable interest rates with our fixed deposit options. Choose from a variety of tenures and interest rates from premier banks and financial institutions to support your capital preservation goals.',
    features: [
      'Competitive interest rates',
      'Flexible tenure options',
      'Predictable interest rates',
      'Bank and NBFC FDs',
      'Premature withdrawal options',
    ],
    image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
    link: '/fixed-deposits',
  },
];

export function getServicesForHome() {
  return SERVICES.map((service) => ({
    key: service.key,
    icon: <service.Icon size={40} />,
    title: service.homeTitle,
    description: service.homeDescription,
    image: service.image,
    imagePresentation: service.imagePresentation,
    link: service.link,
  }));
}

export function getServicesForServicesPage() {
  return SERVICES.map((service) => ({
    key: service.key,
    icon: <service.Icon size={50} />,
    title: service.servicesTitle,
    description: service.servicesDescription,
    features: service.features,
    image: service.image,
    imagePresentation: service.imagePresentation,
    link: service.link,
  }));
}
