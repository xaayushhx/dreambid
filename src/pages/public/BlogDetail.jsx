import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeftIcon, CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch single blog
  const { data: blogData, isLoading, error } = useQuery(
    ['blog', id],
    async () => {
      const response = await api.get(`/blogs/${id}`);
      return response.data.data || null;
    },
    {
      staleTime: 1000 * 60 * 5,
    }
  );

  const blog = blogData;

  // Fetch related blogs (same category)
  const { data: relatedBlogsData } = useQuery(
    ['related-blogs', blog?.category],
    async () => {
      if (!blog?.category) return [];
      const response = await api.get('/blogs');
      const allBlogs = response.data.data || [];
      return allBlogs
        .filter(b => b.category === blog.category && b.id !== blog.id)
        .slice(0, 3);
    },
    {
      enabled: !!blog?.category,
      staleTime: 1000 * 60 * 5,
    }
  );

  const relatedBlogs = relatedBlogsData || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 flex items-center justify-center">
        <p className="text-text-secondary text-lg">Loading article...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-6">Article not found</p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-hover font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900 pb-16">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-hover font-medium transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Articles
        </Link>

        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full capitalize">
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {blog.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-text-secondary mb-8 pb-8 border-b border-midnight-700">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {blog.author}
          </div>
          <div className="text-gold font-medium">{blog.readTime}</div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-96 object-cover rounded-lg border border-midnight-700"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="prose prose-invert max-w-none">
          {blog.content ? (
            <div
              className="text-text-secondary leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-text-secondary leading-relaxed">{blog.excerpt}</p>
          )}
        </div>
      </div>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBlogs.map(relatedBlog => (
              <article
                key={relatedBlog.id}
                className="bg-gradient-to-br from-midnight-800 to-midnight-750 rounded-lg overflow-hidden border border-midnight-700 hover:border-gold hover:shadow-lg hover:shadow-gold/10 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-midnight-700">
                  <img
                    src={relatedBlog.image}
                    alt={relatedBlog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full capitalize">
                      {relatedBlog.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {relatedBlog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {relatedBlog.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-4 pb-4 border-b border-midnight-700">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(relatedBlog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {relatedBlog.author}
                    </div>
                  </div>

                  {/* Read Time and Link */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gold">{relatedBlog.readTime}</span>
                    <Link
                      to={`/blogs/${relatedBlog.id}`}
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
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gold/10 to-red-600/10 border border-midnight-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Interested in DreamBid?
          </h2>
          <p className="text-text-secondary mb-6">
            Explore our property auctions and start your bidding journey today.
          </p>
          <Link
            to="/properties"
            className="inline-block px-8 py-3 bg-gold text-midnight-950 font-semibold rounded-lg hover:bg-gold/90 transition-colors"
          >
            Explore Properties
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
