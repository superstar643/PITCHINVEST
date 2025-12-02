import React from 'react';
import { Link } from 'react-router-dom';
import { blogArticles } from '@/lib/blogData';

const ArticlesSection: React.FC = () => {
  const featuredArticle = blogArticles.find((a) => a.id === 1) || blogArticles[0];
  const sideArticles = blogArticles.filter((a) => a.id !== featuredArticle.id).slice(0, 3);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            From the Articles
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Discover insights and stories from our community
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Featured Article */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
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
                <div className="absolute top-4 right-4">
                  <span className="text-gray-600 text-sm font-medium bg-white/90 px-3 py-1 rounded-full">
                    {featuredArticle.date.split(',')[0].split(' ').slice(0, 1).join(' ')} {featuredArticle.date.split(',')[1]?.trim()}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {featuredArticle.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {featuredArticle.description}
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    to="/blog"
                    className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Read article
                  </Link>
                  <span className="text-sm text-gray-500">{featuredArticle.readTime}</span>
                </div>
              </div>
            </article>
          </div>

          {/* Right Column - Side Articles */}
          <div className="space-y-6">
            {sideArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#0a3d5c] text-white px-2 py-1 rounded-full text-xs font-semibold uppercase">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-gray-600 text-xs font-medium bg-white/90 px-2 py-1 rounded-full">
                      {article.date.split(',')[0].split(' ').slice(0, 1).join(' ')} {article.date.split(',')[1]?.trim()}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <Link
                    to="/blog"
                    className="text-[#0a3d5c] hover:text-[#0a3d5c]/80 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;

