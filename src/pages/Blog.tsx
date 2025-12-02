import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { blogArticles, blogCategories, BlogArticle } from '@/lib/blogData';

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = blogArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'ALL' || article.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = blogArticles.find((a) => a.featured && a.id === 1) || blogArticles[0];
  const featuredPosts = blogArticles.filter((a) => a.featured && a.id !== featuredArticle.id).slice(0, 3);

  const gridArticles = filteredArticles.filter((a) => a.id !== featuredArticle.id);

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Discover the Future of <span className="text-[#0a3d5c]">Innovation</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore cutting-edge insights, success stories, and expert guidance on technology, investment, and entrepreneurship from industry leaders.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#0a3d5c] transition-colors"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {blogCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#0a3d5c] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Featured Article */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#0a3d5c] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {featuredArticle.category}
                  </span>
                </div>
                {featuredArticle.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#0a3d5c] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      FEATURED
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {featuredArticle.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium">{featuredArticle.author}, {featuredArticle.authorTitle}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                </div>
              </div>
            </article>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Featured Posts */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Posts</h3>
              <div className="space-y-4">
                {featuredPosts.map((post) => (
                  <div key={post.id} className="flex gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {blogCategories
                  .filter((cat) => cat !== 'ALL')
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#0a3d5c] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#0a3d5c] text-white px-2 py-1 rounded-full text-xs font-semibold uppercase">
                    {article.category}
                  </span>
                </div>
                {article.featured && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#0a3d5c] text-white px-2 py-1 rounded-full text-xs font-semibold uppercase">
                      FEATURED
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {gridArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

