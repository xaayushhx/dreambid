import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

function Blogs() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch blogs from API
  const { data: blogsData, isLoading, error } = useQuery(
    'public-blogs',
    async () => {
      const response = await api.get('/blogs');
      return response.data.data || [];
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const blogs = blogsData || [];

  const categories = [
    { id: 'all', label: 'All Articles' },
    ...Array.from(new Set(blogs.map(b => b.category))).map(cat => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  ];

  const filteredBlogs = selectedCategory === 'all' 
    ? blogs
    : blogs.filter(blog => blog.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 pt-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            DreamBid <span className="text-gold">Blog</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Explore articles, tips, and insights about bank property auctions and real estate investments.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                selectedCategory === category.id
                  ? 'bg-gold text-midnight-950 shadow-lg shadow-gold/50'
                  : 'bg-midnight-800 text-text-secondary border border-midnight-700 hover:border-gold hover:text-gold'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Failed to load articles. Please try again later.</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              No articles found in this category. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <article
                key={blog.id}
                className="bg-gradient-to-br from-midnight-800 to-midnight-750 rounded-lg overflow-hidden border border-midnight-700 hover:border-gold hover:shadow-lg hover:shadow-gold/10 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-midnight-700 flex items-center justify-center">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.523 0 10-4.649 10-10.747S17.523 6.253 12 6.253z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full capitalize">
                      {blog.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-4 pb-4 border-b border-midnight-700">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {blog.author}
                    </div>
                  </div>

                  {/* Read Time and Link */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gold">{blog.readTime}</span>
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="inline-flex items-center gap-2 text-gold hover:text-gold-hover font-medium text-sm transition-colors group/link"
                    >
                      Read More
                      <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Articles Message - handled above in loading/error/empty states */}
      </div>
    </div>
  );
}

export default Blogs;
