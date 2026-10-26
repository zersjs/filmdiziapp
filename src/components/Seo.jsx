import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_DESCRIPTION, DEFAULT_IMAGE_PATH, SITE_NAME, STATIC_PAGES, absoluteUrl, formatPageTitle,
} from '../lib/seo';

export const getSiteUrl = () =>
  (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

// Her sayfanın başlık, açıklama, canonical, Open Graph, Twitter ve JSON-LD etiketleri.
// Sunucu (api/render.js) aynı etiketleri data-rh ile basar; Helmet bunları devralıp günceller.
const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd = [],
}) => {
  const siteUrl = getSiteUrl();
  const fullTitle = formatPageTitle(title);
  const canonical = path ? absoluteUrl(siteUrl, path) : null;
  const ogImage = absoluteUrl(siteUrl, image || DEFAULT_IMAGE_PATH);

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'} />
      {canonical && !noindex && <link rel="canonical" href={canonical} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd.filter(Boolean).map((data, index) => (
        <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
};

export const StaticSeo = ({ path }) => (
  <Seo title={STATIC_PAGES[path].title} description={STATIC_PAGES[path].description} path={path} />
);

export default Seo;
