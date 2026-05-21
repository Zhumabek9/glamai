import React, { useState } from 'react';
import { Clock, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { t } from '../utils/i18n';

const BLOG_ARTICLES = [
  {
    id: 1,
    slug: 'best-hairstyles-for-face-shapes',
    category: 'Guides',
    title: 'The Best Hairstyles for Every Face Shape in 2025',
    excerpt: 'Finding the perfect hairstyle starts with understanding your face shape. Whether you have an oval, round, square, or heart-shaped face, there\'s a style that will flatter your features perfectly.',
    minRead: 7,
    date: 'May 14, 2025',
    color: 'linear-gradient(135deg, #ff9eb5 0%, #ffccd5 100%)',
    icon: '✂️',
    tags: ['Hairstyle Tips', 'Face Shape', 'Guide'],
  },
  {
    id: 2,
    slug: 'trending-hair-colors-2025',
    category: 'Trends',
    title: 'Top 10 Trending Hair Colors for 2025',
    excerpt: 'From dimensional brunettes to bold fashion colors, 2025 is all about personalized, expressive hair color. Discover which shades are dominating salons and social media this year.',
    minRead: 5,
    date: 'May 8, 2025',
    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    icon: '🎨',
    tags: ['Hair Color', 'Trends', '2025'],
  },
  {
    id: 3,
    slug: 'ai-hair-try-on-guide',
    category: 'AI Tools',
    title: 'How to Use AI Hair Try-On Tools for Best Results',
    excerpt: 'Virtual hair try-on technology has revolutionized how we choose new hairstyles. Here\'s everything you need to know to get the most photorealistic results from AI hair tools.',
    minRead: 6,
    date: 'Apr 30, 2025',
    color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    icon: '🤖',
    tags: ['AI Tools', 'How-To', 'Technology'],
  },
  {
    id: 4,
    slug: 'wolf-cut-complete-guide',
    category: 'Styles',
    title: 'Wolf Cut: The Complete Guide to 2025\'s Most Popular Style',
    excerpt: 'The wolf cut continues to dominate in 2025. Part shag, part mullet, entirely modern — here\'s everything you need to know about this iconic cut and whether it suits you.',
    minRead: 8,
    date: 'Apr 22, 2025',
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    icon: '🐺',
    tags: ['Wolf Cut', 'Popular Styles', 'Trends'],
  },
  {
    id: 5,
    slug: 'hair-care-tips-color-treated',
    category: 'Hair Care',
    title: '12 Essential Hair Care Tips for Color-Treated Hair',
    excerpt: 'Color-treated hair needs extra TLC. From the right shampoo to heat protection and toning routines, these expert tips will keep your color vibrant and your hair healthy.',
    minRead: 6,
    date: 'Apr 15, 2025',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '💆',
    tags: ['Hair Care', 'Color Treatment', 'Tips'],
  },
  {
    id: 6,
    slug: 'pixie-cut-comeback-2025',
    category: 'Styles',
    title: 'The Pixie Cut Comeback: Why Short Hair Is Ruling 2025',
    excerpt: 'Short hair is having a major moment. The pixie cut in all its variations — from textured to sleek to bold undercut — is back with fresh energy. Here\'s why you should consider the chop.',
    minRead: 5,
    date: 'Apr 5, 2025',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '💇',
    tags: ['Pixie Cut', 'Short Hair', 'Trends'],
  },
];

const CATEGORIES = ['All', 'Guides', 'Trends', 'AI Tools', 'Styles', 'Hair Care'];

export default function Blog({ onStartClick }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedArticle, setExpandedArticle] = useState(null);

  const filtered = activeCategory === 'All'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Blog Hero */}
      <section style={{
        padding: '4rem 0 3rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(255,46,147,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,46,147,0.06)'
      }}>
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="section-badge" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            {t('blog.inspiration')}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.75rem',
            fontWeight: 800,
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            lineHeight: 1.15
          }}>
            {t('blog.title')}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{ padding: '2rem 0', borderBottom: '1px solid rgba(255,46,147,0.06)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: activeCategory === cat
                    ? '1px solid var(--color-pink-primary)'
                    : '1px solid rgba(255,46,147,0.15)',
                  background: activeCategory === cat
                    ? 'var(--gradient-pink-purple)'
                    : 'rgba(255,255,255,0.6)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(255,46,147,0.2)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <section style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              {t('blog.noArticles')}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {filtered.map(article => (
                <article
                  key={article.id}
                  className="glass-panel"
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(255,46,147,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Card image / gradient header */}
                  <div style={{
                    background: article.color,
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3.5rem',
                    position: 'relative',
                  }}>
                    <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>{article.icon}</span>
                    <span style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'rgba(255,255,255,0.9)',
                      color: 'var(--color-pink-primary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {article.category}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <span>{article.date}</span>
                      <span>·</span>
                      <Clock size={12} />
                      <span>{article.minRead} {t('blog.minRead')}</span>
                    </div>

                    <h2 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.35,
                      margin: 0,
                    }}>
                      {article.title}
                    </h2>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                      flex: 1,
                    }}>
                      {article.excerpt}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {article.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(255,46,147,0.07)',
                          color: 'var(--color-pink-primary)',
                          border: '1px solid rgba(255,46,147,0.12)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      style={{
                        marginTop: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-pink-primary)',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'gap 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.gap = '0.6rem'}
                      onMouseLeave={e => e.currentTarget.style.gap = '0.35rem'}
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    >
                      {t('blog.readMore')} <ArrowRight size={14} />
                    </button>

                    {/* Inline expanded content */}
                    {expandedArticle === article.id && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        background: 'rgba(255,46,147,0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,46,147,0.08)',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                        animation: 'fadeIn 0.3s ease forwards',
                      }}>
                        <p style={{ margin: '0 0 0.75rem' }}>{article.excerpt}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Full article coming soon. In the meantime, try our AI hairstyle tool to see any style on yourself instantly!
                        </p>
                        {/* Try This Look CTA */}
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(255,46,147,0.06) 0%, rgba(138,43,226,0.06) 100%)',
                          borderRadius: '12px',
                          textAlign: 'center',
                        }}>
                          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {t('blog.tryThisLook')}
                          </p>
                          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {t('blog.tryThisLookDesc')}
                          </p>
                          <button
                            className="btn btn-primary"
                            onClick={onStartClick}
                            style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
                          >
                            <Sparkles size={14} />
                            {t('blog.tryFree')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,46,147,0.06) 0%, rgba(138,43,226,0.06) 100%)',
        borderTop: '1px solid rgba(255,46,147,0.08)',
        padding: '4rem 0',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
          }}>
            {t('blog.ctaTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            {t('blog.ctaDesc')}
          </p>
          <button className="btn btn-primary" onClick={onStartClick} style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
            <Sparkles size={16} />
            {t('blog.tryFree')}
          </button>
        </div>
      </div>
    </div>
  );
}
