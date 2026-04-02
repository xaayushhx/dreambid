INSERT INTO blogs (title, excerpt, content, category, author, read_time, status, created_by, created_at, updated_at) VALUES
  ('Getting Started with Property Auctions', 
   'Learn the basics of property auctions and how to participate',
   'Property auctions are a great way to find deals. In this comprehensive guide, we explore the key steps to get started with online property auctions. From bidding strategies to due diligence, master all the essentials.',
   'buying', 'Admin', '5 min read', 'published', 1, NOW(), NOW()),
   
  ('Investment Tips for Property Auctions',
   'Smart strategies to maximize returns from auction properties',
   'Investing in properties through auctions can yield significant returns. Discover proven investment strategies, risk assessment techniques, and portfolio management tips from industry experts.',
   'investment', 'Admin', '8 min read', 'published', 1, NOW(), NOW()),
   
  ('Understanding Property Auction Laws',
   'Know your rights and responsibilities as an auction participant',
   'Property auctions are governed by specific legal frameworks. This guide covers the essential laws, regulations, and consumer protections you need to know before participating in auctions.',
   'legal', 'Admin', '6 min read', 'published', 1, NOW(), NOW()),
   
  ('Market Trends in Property Auctions',
   'Latest insights and trends shaping the auction market',
   'The property auction market is evolving rapidly. Explore current market trends, price movements, and predictive insights that can help you make informed bidding decisions.',
   'market', 'Admin', '7 min read', 'published', 1, NOW(), NOW());

SELECT * FROM blogs;
