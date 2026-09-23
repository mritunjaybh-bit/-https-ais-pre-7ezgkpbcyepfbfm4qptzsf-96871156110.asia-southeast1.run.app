import React, { useState, useMemo } from 'react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/blogPosts';
import { BlogSEO } from './BlogSEO';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  ShoppingBag,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

interface BlogListingPageProps {
  onSelectPost: (post: BlogPost) => void;
  onNavigateToShop: () => void;
}

export const BlogListingPage: React.FC<BlogListingPageProps> = ({
  onSelectPost,
  onNavigateToShop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const cats = ['All'];
    BLOG_POSTS.forEach((p) => {
      if (!cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS[0]; // Spotlight first guide

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#fff8f6] py-8 sm:py-12">
      {/* Dynamic SEO Meta Tags for Blog Listing */}
      <BlogSEO isListing={true} />

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Editorial Journal Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#feca4d]/20 border border-[#feca4d]/40 text-[#785a00] text-xs font-bold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-[#785a00]" />
            <span>The Cà Phê Journal</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#271310] tracking-tight font-serif-brand"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Stories, Brew Guides & Origins
          </h1>

          <p className="text-sm sm:text-base text-[#504442] leading-relaxed max-w-2xl mx-auto">
            Immerse yourself in Vietnam’s rich coffee heritage. From mastering the meditative Phin gravity dripper and understanding potent volcanic Robusta to the 19th-century invention of Cà Phê Sữa Đá.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#d3c3c0]/60 pb-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#271310] text-white shadow-xs'
                    : 'bg-white text-[#504442] hover:text-[#271310] hover:bg-[#faf2f0] border border-[#d3c3c0]/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#827472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles or brew tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#d3c3c0]/80 text-xs text-[#271310] placeholder:text-[#827472] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00] transition-colors"
            />
          </div>
        </div>

        {/* Featured Spotlight Card (Shown when viewing "All" and no search query) */}
        {selectedCategory === 'All' && !searchQuery && featuredPost && (
          <div className="bg-white rounded-2xl border border-[#d3c3c0]/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Image Column */}
              <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-[#271310]/5">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#271310]/90 text-[#feca4d] backdrop-blur-xs text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider border border-[#feca4d]/40 shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#feca4d]" />
                    Featured Masterclass
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-[#827472]">
                  <span className="font-semibold text-[#785a00] uppercase tracking-wider text-[11px] bg-[#feca4d]/20 px-2.5 py-0.5 rounded-full border border-[#feca4d]/30">
                    {featuredPost.category}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>

                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#271310] group-hover:text-[#785a00] transition-colors leading-tight font-serif-brand cursor-pointer"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  onClick={() => onSelectPost(featuredPost)}
                >
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#504442] leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-2 border-t border-[#d3c3c0]/40">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#d3c3c0]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#271310]">
                        {featuredPost.author.name}
                      </div>
                      <div className="text-[10px] text-[#827472]">
                        {featuredPost.author.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPost(featuredPost)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#785a00] hover:text-[#271310] group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid of Articles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3
              className="text-xl font-bold text-[#271310] font-serif-brand"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {selectedCategory === 'All' ? 'All Articles & Guides' : `${selectedCategory} (${filteredPosts.length})`}
            </h3>
            <span className="text-xs text-[#827472]">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#d3c3c0]/60 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#faf2f0] flex items-center justify-center text-[#785a00] mx-auto">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#271310]">No articles found</h4>
              <p className="text-xs text-[#827472] max-w-sm mx-auto">
                We couldn’t find any articles matching your search query. Try clearing your filters or search for "Phin" or "Robusta".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#271310] text-white text-xs font-bold rounded-lg hover:bg-[#3e2723] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="bg-white rounded-2xl border border-[#d3c3c0]/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1"
                >
                  {/* Article Thumbnail */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-[#271310]/5">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-[#271310]/90 text-[#feca4d] backdrop-blur-xs text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-[#feca4d]/30">
                      {post.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Meta stats: Date & Read Time */}
                      <div className="flex items-center gap-3 text-[11px] text-[#827472]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{post.publishDate}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        className="text-base sm:text-lg font-bold text-[#271310] group-hover:text-[#785a00] transition-colors leading-snug font-serif-brand line-clamp-2"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                      >
                        {post.title}
                      </h4>

                      {/* Excerpt */}
                      <p className="text-xs text-[#504442] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer: Author & Read Link */}
                    <div className="pt-3 border-t border-[#d3c3c0]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-[#d3c3c0]"
                        />
                        <span className="text-[11px] font-medium text-[#504442]">
                          {post.author.name}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#785a00] group-hover:text-[#271310] transition-colors">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Call to Action: Shop Fresh Single-Origin Vietnamese Coffee */}
        <div className="bg-[#271310] text-white rounded-2xl p-6 sm:p-10 border border-[#3e2723] relative overflow-hidden shadow-md">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#feca4d] bg-[#feca4d]/15 px-3 py-1 rounded-full border border-[#feca4d]/30 inline-block">
              Direct-Trade Central Highlands Beans
            </span>

            <h3
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif-brand"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Taste the Authentic Brews from Our Journal
            </h3>

            <p className="text-xs sm:text-sm text-[#ae8d87] leading-relaxed">
              Bring the stories to your kitchen. Order artisanal Fine Robusta powders, authentic stainless steel Phin kits, or micro-ground condensed milk instant sachets delivered fresh with air-dispatch across India.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToShop}
                className="bg-[#feca4d] hover:bg-[#ffc02e] text-[#271310] text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Fresh Coffee & Phin Kits</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-[#f4eceb]/80 ml-2">
                <CheckCircle2 className="w-4 h-4 text-[#feca4d]" />
                <span>Free shipping on orders above ₹799</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
