import React, { useState } from 'react';
import { BlogPost } from '../types';
import { getRecentBlogPosts } from '../data/blogPosts';
import { BlogSEO } from './BlogSEO';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  ShoppingBag,
  Sparkles,
  Bookmark,
  Coffee,
  ChevronRight,
  Quote,
  Lightbulb,
} from 'lucide-react';

interface BlogPostPageProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onNavigateToShop: () => void;
  onSelectRelatedPost: (post: BlogPost) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  post,
  onBackToBlog,
  onNavigateToShop,
  onSelectRelatedPost,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const relatedPosts = getRecentBlogPosts(post.slug, 2);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2500);
        });
      }
    }
  };

  return (
    <article className="w-full max-w-full overflow-hidden bg-[#fff8f6] py-6 sm:py-10">
      {/* Dynamic SEO Meta & Article Schema JSON-LD */}
      <BlogSEO post={post} />

      <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Breadcrumb & Action Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d3c3c0]/60 pb-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBackToBlog}
              className="inline-flex items-center gap-1.5 font-bold text-[#785a00] hover:text-[#271310] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Journal</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#827472]" />
            <span className="text-[#827472] font-medium truncate max-w-[180px] sm:max-w-[280px]">
              {post.category}
            </span>
          </div>

          {/* Call-to-action to shop */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onNavigateToShop}
              className="inline-flex items-center gap-1.5 bg-[#271310] hover:bg-[#3e2723] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Shop artisanal Vietnamese coffee powders and Phin kits"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#feca4d]" />
              <span>Shop Our Coffee</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 bg-white hover:bg-[#faf2f0] border border-[#d3c3c0] text-[#504442] hover:text-[#271310] text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Share article link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#785a00]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Post Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-bold text-[#785a00] uppercase tracking-wider text-[11px] bg-[#feca4d]/20 px-3 py-1 rounded-full border border-[#feca4d]/35">
              {post.category}
            </span>
            <div className="flex items-center gap-1 text-[#827472]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishDate}</span>
            </div>
            <span className="text-[#827472]">•</span>
            <div className="flex items-center gap-1 text-[#827472]">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1
            className="text-2xl sm:text-4xl md:text-[42px] font-bold text-[#271310] leading-tight tracking-tight font-serif-brand"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#504442] leading-relaxed font-medium">
            {post.excerpt}
          </p>

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#d3c3c0]/40">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-[#d3c3c0] shadow-xs"
            />
            <div>
              <div className="text-xs font-bold text-[#271310]">
                {post.author.name}
              </div>
              <div className="text-[11px] text-[#827472]">
                {post.author.role}
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image with Caption */}
        <figure className="space-y-2">
          <div className="w-full h-72 sm:h-96 md:h-[460px] rounded-2xl overflow-hidden border border-[#d3c3c0]/80 shadow-sm bg-[#271310]/5">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          {post.imageCaption && (
            <figcaption className="text-center text-[11px] text-[#827472] italic">
              {post.imageCaption}
            </figcaption>
          )}
        </figure>

        {/* Body Content Blocks */}
        <div className="space-y-6 text-[#271310] leading-relaxed font-sans text-[15px] sm:text-base">
          {post.content.map((block, idx) => {
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={idx} className="text-[#3c302d] leading-relaxed">
                    {block.text}
                  </p>
                );

              case 'heading':
                if (block.level === 2) {
                  return (
                    <h2
                      key={idx}
                      className="text-xl sm:text-2xl font-bold text-[#271310] pt-4 border-b border-[#d3c3c0]/40 pb-2 font-serif-brand"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      {block.text}
                    </h2>
                  );
                } else {
                  return (
                    <h3
                      key={idx}
                      className="text-lg sm:text-xl font-bold text-[#271310] pt-2 font-serif-brand text-[#785a00]"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      {block.text}
                    </h3>
                  );
                }

              case 'list':
                if (block.ordered) {
                  return (
                    <ol
                      key={idx}
                      className="space-y-2.5 list-decimal pl-5 text-[#3c302d] text-sm sm:text-[15px]"
                    >
                      {block.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ol>
                  );
                } else {
                  return (
                    <ul
                      key={idx}
                      className="space-y-2 list-disc pl-5 text-[#3c302d] text-sm sm:text-[15px]"
                    >
                      {block.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

              case 'callout':
                return (
                  <div
                    key={idx}
                    className="my-4 p-4 sm:p-5 rounded-xl bg-[#faf2f0] border-l-4 border-[#785a00] border-t border-r border-b border-[#d3c3c0]/60 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#785a00] uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-[#785a00]" />
                      <span>{block.title || 'Barista Tip'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#3c302d] leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                );

              case 'quote':
                return (
                  <blockquote
                    key={idx}
                    className="my-6 p-5 sm:p-6 rounded-2xl bg-white border border-[#d3c3c0]/60 shadow-2xs relative space-y-2"
                  >
                    <Quote className="w-6 h-6 text-[#feca4d] opacity-70" />
                    <p
                      className="text-base sm:text-lg italic text-[#271310] font-serif-brand"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      "{block.text}"
                    </p>
                    {block.author && (
                      <cite className="block text-xs font-semibold text-[#785a00] not-italic">
                        — {block.author}
                      </cite>
                    )}
                  </blockquote>
                );

              case 'image':
                return (
                  <figure key={idx} className="my-6 space-y-2">
                    <img
                      src={block.url}
                      alt={block.alt}
                      className="w-full rounded-xl border border-[#d3c3c0] shadow-xs"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-[11px] text-[#827472] italic">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );

              default:
                return null;
            }
          })}
        </div>

        {/* Tags & Share Section */}
        <div className="pt-6 border-t border-[#d3c3c0]/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#827472] mr-1">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-white border border-[#d3c3c0] text-[#504442] px-2.5 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#785a00] hover:text-[#271310] transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link copied to clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share this article</span>
              </>
            )}
          </button>
        </div>

        {/* Product / Roastery Mid-Post Callout Card */}
        <div className="bg-[#271310] text-[#f4eceb] rounded-2xl p-6 sm:p-8 border border-[#3e2723] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#feca4d] bg-[#feca4d]/15 px-2.5 py-0.5 rounded-full border border-[#feca4d]/30">
              <Sparkles className="w-3 h-3 text-[#feca4d]" />
              <span>Direct From Central Highlands</span>
            </div>
            <h4
              className="text-lg sm:text-xl font-bold text-white font-serif-brand"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Ready to Brew Like a Vietnamese Master?
            </h4>
            <p className="text-xs text-[#ae8d87] max-w-md">
              Order authentic heirloom Robusta ground powders, artisanal egg & cacao blends, and stainless steel Phin drippers.
            </p>
          </div>

          <button
            onClick={onNavigateToShop}
            className="shrink-0 bg-[#feca4d] hover:bg-[#ffc02e] text-[#271310] text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-[#271310]" />
            <span>Shop Coffee & Phin</span>
          </button>
        </div>

        {/* Related Reads & Navigation */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-[#d3c3c0]/60 space-y-6">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg sm:text-xl font-bold text-[#271310] font-serif-brand"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                More From The Journal
              </h3>
              <button
                onClick={onBackToBlog}
                className="text-xs font-bold text-[#785a00] hover:text-[#271310] transition-colors cursor-pointer"
              >
                View All Articles →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedPost(rel)}
                  className="bg-white rounded-xl border border-[#d3c3c0]/80 p-4 hover:shadow-md transition-shadow cursor-pointer flex gap-3 group"
                >
                  <img
                    src={rel.featuredImage}
                    alt={rel.title}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-[#d3c3c0]"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#785a00] uppercase tracking-wider block">
                      {rel.category}
                    </span>
                    <h5
                      className="text-xs font-bold text-[#271310] group-hover:text-[#785a00] transition-colors line-clamp-2 leading-snug font-serif-brand"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      {rel.title}
                    </h5>
                    <span className="text-[10px] text-[#827472] block">
                      {rel.readTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
