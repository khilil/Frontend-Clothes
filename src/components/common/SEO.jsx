import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  name = 'Fenrir Era', 
  type = 'website', 
  image = '/images/og-image.jpg', // Default OG image path
  url = window.location.href,
  keywords = 'Fenrir Era, Fashion, Online Shopping, Custom T-shirts, Streetwear'
}) => {
  const fullTitle = title ? `${title} | ${name}` : name;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
