export interface BlogArticle {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: string;
  featured: boolean;
}

export const blogCategories = [
  'ALL',
  'ENTREPRENEURSHIP',
  'INNOVATION',
  'INVESTMENT',
  'LEGAL & IP',
  'SUCCESS STORIES',
  'TECHNOLOGY',
];

export const blogArticles: BlogArticle[] = [
  {
    id: 1,
    title: 'The Future of Medical Innovation: How AI is Transforming Healthcare',
    description: 'Discover how artificial intelligence is revolutionizing medical diagnostics, drug discovery, and patient care. From machine learning algorithms that detect diseases earlier to AI-powered robotic surgery, explore the cutting-edge innovations shaping the future of healthcare.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    category: 'TECHNOLOGY',
    author: 'Dr. James Chen',
    authorTitle: 'Investment Analyst',
    date: 'Oct 28, 2024',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: 2,
    title: '5 Essential Steps to Protect Your Invention with Patents',
    description: 'Learn the fundamental steps to secure your intellectual property through patents. This comprehensive guide covers everything from conducting patent searches to filing applications and protecting your innovations.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
    category: 'LEGAL & IP',
    author: 'Sarah Mitchell',
    authorTitle: 'IP Attorney',
    date: 'Oct 25, 2024',
    readTime: '6 min read',
    featured: true,
  },
  {
    id: 3,
    title: 'Understanding Venture Capital: What Investors Look For',
    description: 'Gain insights into the venture capital world and understand what investors truly seek in startups. Learn about key metrics, pitch strategies, and how to position your company for successful funding rounds.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    category: 'INVESTMENT',
    author: 'Michael Roberts',
    authorTitle: 'VC Partner',
    date: 'Oct 20, 2024',
    readTime: '10 min read',
    featured: true,
  },
  {
    id: 4,
    title: 'Quantum Computing: The Next Frontier in Technology',
    description: 'Explore the revolutionary potential of quantum computing and how it will transform industries from cryptography to drug discovery. Understand the basics and future implications of this groundbreaking technology.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    category: 'TECHNOLOGY',
    author: 'Dr. Emily Watson',
    authorTitle: 'Quantum Researcher',
    date: 'Oct 12, 2024',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: 5,
    title: 'Space Tech Revolution: Private Innovation Beyond Earth',
    description: 'Discover how private companies are driving innovation in space technology, from reusable rockets to satellite constellations. Learn about the investment opportunities in this rapidly growing sector.',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
    category: 'INNOVATION',
    author: 'Alex Thompson',
    authorTitle: 'Space Tech Analyst',
    date: 'Oct 15, 2024',
    readTime: '7 min read',
    featured: true,
  },
  {
    id: 6,
    title: 'From Garage to Global: The Journey of a Successful Startup',
    description: 'Follow the inspiring story of a startup that grew from a small garage operation to a global enterprise. Learn the key decisions, challenges, and strategies that led to their success.',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop',
    category: 'SUCCESS STORIES',
    author: 'Jennifer Lee',
    authorTitle: 'Business Journalist',
    date: 'Oct 10, 2024',
    readTime: '9 min read',
    featured: false,
  },
  {
    id: 7,
    title: 'The Rise of Biotech: Innovations Shaping the Future',
    description: 'Explore the latest breakthroughs in biotechnology, from gene editing to personalized medicine. Understand how biotech innovations are creating new investment opportunities.',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=600&fit=crop',
    category: 'INNOVATION',
    author: 'Dr. Robert Kim',
    authorTitle: 'Biotech Expert',
    date: 'Oct 8, 2024',
    readTime: '11 min read',
    featured: false,
  },
  {
    id: 8,
    title: 'Navigating the Innovation Ecosystem: A Guide for Entrepreneurs',
    description: 'Learn how to navigate the complex innovation ecosystem, from finding mentors to accessing resources. This guide provides practical advice for entrepreneurs at every stage.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    category: 'ENTREPRENEURSHIP',
    author: 'David Martinez',
    authorTitle: 'Startup Advisor',
    date: 'Oct 5, 2024',
    readTime: '8 min read',
    featured: false,
  },
  {
    id: 9,
    title: 'Building Strategic Partnerships: Lessons from Industry Leaders',
    description: 'Discover how successful companies build and maintain strategic partnerships. Learn from real-world examples and understand the key principles of effective collaboration.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    category: 'SUCCESS STORIES',
    author: 'Lisa Anderson',
    authorTitle: 'Business Strategist',
    date: 'Oct 3, 2024',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 10,
    title: 'The Economics of Innovation: Understanding Market Dynamics',
    description: 'Dive deep into the economic principles that drive innovation markets. Understand supply and demand dynamics, pricing strategies, and market opportunities in the innovation space.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    category: 'INVESTMENT',
    author: 'Prof. Mark Johnson',
    authorTitle: 'Economics Professor',
    date: 'Oct 1, 2024',
    readTime: '10 min read',
    featured: false,
  },
];

