import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, UserIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Image carousel functions
  const allImages = blog?.images && blog.images.length > 0 
    ? blog.images 
    : (blog?.image ? [{ image_data: blog.image }] : []);
  
  const currentImage = allImages[currentImageIndex];
  
  const goToPrevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };
  
  const goToNextImage = () => {
    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };

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
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 to-midnight-900">
      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-hover font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to All Articles
        </Link>
      </div>

      {/* Hero Section with Image Carousel */}
      {allImages.length > 0 && (
        <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] bg-midnight-800 overflow-hidden mb-12">
          {/* Main carousel image */}
          <div className="relative w-full h-full">
            <img
              src={getImageUrl(currentImage?.image_data || currentImage?.image_url || '')}
              alt={`${blog.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent"></div>
            
            {/* Image counter badge */}
            <div className="absolute bottom-4 right-4 bg-midnight-950/80 backdrop-blur-sm px-4 py-2 rounded-lg text-gold text-sm font-medium border border-midnight-700">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={goToPrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-midnight-950/70 hover:bg-midnight-950 text-gold p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-midnight-950/70 hover:bg-midnight-950 text-gold p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnail carousel at bottom */}
          {allImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-midnight-950 to-transparent p-4">
              <div className="flex gap-2 overflow-x-auto max-w-4xl mx-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'border-gold shadow-lg shadow-gold/50' 
                        : 'border-midnight-700 hover:border-gold/50'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.image_data || img.image_url || '')}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* Category and Meta */}
        <div className="mb-6">
          <div className="inline-block px-4 py-1.5 bg-gold/20 text-gold text-xs font-bold rounded-full uppercase tracking-wide mb-6">
            {blog.category}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Author and Meta Info */}
          <div className="flex flex-wrap items-center gap-8 pb-6 border-b border-midnight-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-red-600 flex items-center justify-center text-midnight-950 font-bold text-lg">
                {blog.author.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold">{blog.author}</p>
                <p className="text-text-secondary text-sm">Author</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-text-secondary">
              <CalendarIcon className="w-5 h-5 text-gold" />
              <span className="text-sm">
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-text-secondary">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414l1-1A1 1 0 0011 9.414V6z"></path>
              </svg>
              <span className="text-sm font-medium text-gold">{blog.readTime}</span>
            </div>
          </div>
        </div>

        {/* Article Excerpt */}
        <p className="text-lg text-text-secondary mb-12 italic leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none mb-16">
          {blog.content ? (
            <div
              className="text-text-secondary leading-relaxed whitespace-pre-wrap text-base"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-text-secondary leading-relaxed">{blog.excerpt}</p>
          )}
        </div>
      </div>

      {/* Share and Actions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 py-8 border-t border-b border-midnight-700">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-text-secondary text-sm">Share this article:</span>
            <div className="flex gap-3">
              <button className="text-text-secondary hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"></path></svg>
              </button>
              <button className="text-text-secondary hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z"></path></svg>
              </button>
              <button className="text-text-secondary hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path></svg>
              </button>
            </div>
          </div>
          <Link
            to="/blogs"
            className="px-6 py-2 bg-midnight-800 hover:bg-midnight-700 text-gold border border-midnight-700 rounded-lg transition-colors"
          >
            View More Articles
          </Link>
        </div>
      </div>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Related Articles
          </h2>
          <p className="text-text-secondary mb-12">Explore more insights on this topic</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedBlogs.map(relatedBlog => (
              <Link
                key={relatedBlog.id}
                to={`/blogs/${relatedBlog.id}`}
                className="group bg-gradient-to-br from-midnight-800 to-midnight-750 rounded-xl overflow-hidden border border-midnight-700 hover:border-gold hover:shadow-2xl hover:shadow-gold/20 transition-all duration-300"
              >
                {/* Image */}
                <div className="h-56 overflow-hidden bg-midnight-700 relative">
                  {relatedBlog.image ? (
                    <img
                      src={relatedBlog.image}
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.523 0 10-4.649 10-10.747S17.523 6.253 12 6.253z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full capitalize">
                      {relatedBlog.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors">
                    {relatedBlog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                    {relatedBlog.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{new Date(relatedBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>{relatedBlog.readTime}</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gold/10 via-midnight-800 to-red-600/10 border-y border-midnight-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Auction Journey?
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Discover premium properties and start bidding with DreamBid today. Join thousands of satisfied bidders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center px-8 py-3 bg-gold text-midnight-950 font-bold rounded-lg hover:bg-gold/90 transition-all duration-300 hover:shadow-lg hover:shadow-gold/50"
            >
              Explore Properties
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center px-8 py-3 bg-midnight-800 text-gold border border-midnight-700 font-bold rounded-lg hover:bg-midnight-700 transition-all duration-300"
            >
              More Articles
            </Link>
          </div>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
}

export default BlogDetail;
