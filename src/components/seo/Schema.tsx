import type { Trade, City } from '@/types';

// Organization schema for the company
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RingByRing',
    url: 'https://www.ringbyring.com',
    logo: 'https://www.ringbyring.com/logo.png',
    description: 'AI-powered answering service for small businesses. Never miss a call again.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-347-919-2658',
      contactType: 'sales',
      availableLanguage: ['English', 'Spanish'],
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service schema for the main product
export function ServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'RingByRing AI Answering Service',
    provider: {
      '@type': 'Organization',
      name: 'RingByRing',
    },
    description: 'AI-powered phone answering service that handles calls 24/7, books appointments, and captures leads for service businesses.',
    serviceType: 'Answering Service',
    areaServed: {
      '@type': 'Country',
      name: 'Canada',
    },
    offers: {
      '@type': 'Offer',
      price: '149',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '149',
        priceCurrency: 'USD',
        unitText: 'month',
        billingIncrement: 1,
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AI Answering Service Plans',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Unlimited AI Answering',
            description: 'Unlimited calls, 24/7 coverage, appointment booking, bilingual support',
          },
          price: '149',
          priceCurrency: 'USD',
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite schema for search box
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RingByRing',
    url: 'https://www.ringbyring.com',
    description: 'AI-powered answering service for service businesses',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.ringbyring.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ schema for rich results
interface FAQ {
  q: string;
  a: string;
}

export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb schema for navigation
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Local service schema for trade/city pages
export function LocalServiceSchema({ trade, city }: { trade: Trade; city: City }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${trade.display_name} Answering Service in ${city.display_name}`,
    provider: {
      '@type': 'Organization',
      name: 'RingByRing',
      url: 'https://www.ringbyring.com',
    },
    description: `Professional AI answering service for ${trade.display_plural.toLowerCase()} in ${city.display_name}, ${city.province}. 24/7 call answering, appointment booking, and lead capture.`,
    serviceType: 'Answering Service',
    areaServed: {
      '@type': 'City',
      name: city.display_name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.province,
      },
    },
    audience: {
      '@type': 'Audience',
      audienceType: trade.display_plural,
    },
    offers: {
      '@type': 'Offer',
      price: '149',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
      url: `https://www.ringbyring.com/${trade.slug}-answering-service/${city.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema for trade-only pages (without city)
export function TradeSchema({ trade }: { trade: Trade }) {
  const baseUrl = 'https://www.ringbyring.com';

  // Combine trade FAQs with common FAQs
  const allFaqs = [
    ...trade.faqs,
    { q: 'How much does RingByRing cost?', a: '$149/month flat rate, unlimited calls. No per-minute charges, no overage fees, no setup cost. Cancel anytime.' },
    { q: 'How fast can I get set up?', a: 'Most businesses are live in 15 minutes. Sign up, tell us about your business, forward your number, and you\'re done.' },
    { q: 'Does this replace my existing phone service?', a: 'No. You keep your current business number. You just forward calls to RingByRing when you can\'t answer — after hours, when you\'re busy, or all the time.' },
  ];

  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: `${trade.display_name} Answering Service`, url: `${baseUrl}/${trade.slug}-answering-service` },
  ];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${trade.display_name} Answering Service`,
    provider: {
      '@type': 'Organization',
      name: 'RingByRing',
      url: baseUrl,
    },
    description: `Professional AI answering service for ${trade.display_plural.toLowerCase()}. 24/7 call answering, appointment booking, and lead capture.`,
    serviceType: 'Answering Service',
    areaServed: {
      '@type': 'Country',
      name: 'Canada',
    },
    audience: {
      '@type': 'Audience',
      audienceType: trade.display_plural,
    },
    offers: {
      '@type': 'Offer',
      price: '149',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
      url: `${baseUrl}/${trade.slug}-answering-service`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <FAQSchema faqs={allFaqs} />
      <BreadcrumbSchema items={breadcrumbs} />
    </>
  );
}

// Combined schema for trade/city pages
export function TradeCitySchema({ trade, city }: { trade: Trade; city: City }) {
  const baseUrl = 'https://www.ringbyring.com';

  // Combine trade FAQs with common FAQs
  const allFaqs = [
    ...trade.faqs,
    { q: 'How much does RingByRing cost?', a: '$149/month flat rate, unlimited calls. No per-minute charges, no overage fees, no setup cost. Cancel anytime.' },
    { q: 'How fast can I get set up?', a: 'Most businesses are live in 15 minutes. Sign up, tell us about your business, forward your number, and you\'re done.' },
    { q: 'Does this replace my existing phone service?', a: 'No. You keep your current business number. You just forward calls to RingByRing when you can\'t answer — after hours, when you\'re busy, or all the time.' },
  ];

  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: trade.display_plural, url: `${baseUrl}/${trade.slug}-answering-service` },
    { name: city.display_name, url: `${baseUrl}/${trade.slug}-answering-service/${city.slug}` },
  ];

  return (
    <>
      <LocalServiceSchema trade={trade} city={city} />
      <FAQSchema faqs={allFaqs} />
      <BreadcrumbSchema items={breadcrumbs} />
    </>
  );
}
