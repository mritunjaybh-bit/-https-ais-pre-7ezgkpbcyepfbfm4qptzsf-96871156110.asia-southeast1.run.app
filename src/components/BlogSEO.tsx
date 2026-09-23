import React, { useEffect } from 'react';
import { BlogPost } from '../types';

interface BlogSEOProps {
  post?: BlogPost;
  isListing?: boolean;
}

const DEFAULT_TITLE = 'Cà Phê - Authentic Vietnamese Coffee Powders & Instant Blends';
const DEFAULT_DESC =
  'Direct-trade Vietnamese ground coffee powders, flavored blends, 3-in-1 instant sachets, Phin gravity brewing kits, and step-by-step masterclass brewing guides with interactive timers.';

export const BlogSEO: React.FC<BlogSEOProps> = ({ post, isListing }) => {
  useEffect(() => {
    // 1. Determine Title & Description
    const title = post
      ? post.metaTitle || `${post.title} | Cà Phê Journal`
      : isListing
      ? 'The Cà Phê Journal - Vietnamese Coffee Brewing, History & Origin Stories'
      : DEFAULT_TITLE;

    const description = post
      ? post.metaDescription || post.excerpt
      : isListing
      ? 'Explore authentic guides on brewing with traditional Vietnamese Phin filters, Robusta bean heritage, recipes, and the rich history of Cà Phê Sữa Đá.'
      : DEFAULT_DESC;

    const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';
    const imageUrl = post?.featuredImage || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80';

    // 2. Update Document Title
    document.title = title;

    // Helper to update or create a <meta> tag
    const setMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let metaEl = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute(attributeName, attributeValue);
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', contentValue);
    };

    // Helper to update canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', post ? 'article' : 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:site_name', 'Cà Phê Vietnam');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageUrl);

    // 4. Inject or Update Schema.org Article / BlogPosting Structured Data (JSON-LD)
    const schemaScriptId = 'blog-structured-data';
    let scriptEl = document.getElementById(schemaScriptId) as HTMLScriptElement | null;

    if (post) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription || post.excerpt,
        image: [post.featuredImage],
        datePublished: post.dateISO,
        dateModified: post.dateISO,
        inLanguage: 'en-US',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        author: {
          '@type': 'Person',
          name: post.author.name,
          jobTitle: post.author.role,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Cà Phê Vietnam',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://caphevietnam.in',
          logo: {
            '@type': 'ImageObject',
            url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
          },
        },
        articleSection: post.category,
        keywords: post.tags.join(', '),
      };

      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = schemaScriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(articleSchema);
    } else if (isListing) {
      const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'The Cà Phê Journal',
        description: description,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Cà Phê Vietnam',
        },
      };

      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = schemaScriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(collectionSchema);
    } else {
      if (scriptEl) {
        scriptEl.remove();
      }
    }

    // Cleanup on unmount / navigation away
    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('name', 'description', DEFAULT_DESC);
      setMetaTag('property', 'og:title', DEFAULT_TITLE);
      setMetaTag('property', 'og:description', DEFAULT_DESC);
      const existingScript = document.getElementById(schemaScriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [post, isListing]);

  return null;
};
