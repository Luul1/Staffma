import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoText}>STAFMA</span>
          <span style={styles.logoTagline}>HR Management System</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#pricing" style={styles.navLink}>Pricing</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
          <button 
            onClick={() => navigate('/login')} 
            style={styles.loginButton}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            <span style={styles.revolutionize}>Revolutionize</span>
            <span style={styles.hrText}> HR Management</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Kenya's most comprehensive HR solution for modern businesses. 
            Automate payroll, simplify compliance, and empower your team with 
            cutting-edge HR tools designed for the Kenyan market.
          </p>
          <div style={styles.heroButtons}>
            <button 
              onClick={() => navigate('/register')} 
              style={styles.primaryButton}
            >
              Start 14-Day Free Trial
            </button>
            <button 
              onClick={() => window.location.href = '#features'} 
              style={styles.secondaryButton}
            >
              Explore Features
            </button>
          </div>
          <div style={styles.trustBadges}>
            <div style={styles.badge}>🔒 KRA Compliant</div>
            <div style={styles.badge}>⚡ Same-Day Setup</div>
            <div style={styles.badge}>🌟 Local Support</div>
          </div>
        </div>
      </div>

      {/* Add a stats section after hero */}
      <div style={styles.stats}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Businesses Trust Us</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>50,000+</div>
            <div style={styles.statLabel}>Payslips Generated</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>99.9%</div>
            <div style={styles.statLabel}>Uptime</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>24/7</div>
            <div style={styles.statLabel}>Customer Support</div>
          </div>
        </div>
      </div>

      {/* Add testimonials section before pricing */}
      <div style={styles.testimonials}>
        <h2 style={styles.sectionTitle}>What Our Clients Say</h2>
        <div style={styles.testimonialGrid}>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialContent}>
              "STAFMA has transformed how we handle payroll. The automated calculations 
              and compliance features save us countless hours each month."
            </div>
            <div style={styles.testimonialAuthor}>
              <div style={styles.authorName}>Sarah Kamau</div>
              <div style={styles.authorRole}>HR Director, Tech Solutions Ltd</div>
            </div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialContent}>
              "The best HR software we've used. The local support team is exceptional, 
              and the system is perfectly tailored for Kenyan businesses."
            </div>
            <div style={styles.testimonialAuthor}>
              <div style={styles.authorName}>John Ochieng</div>
              <div style={styles.authorRole}>CEO, Retail Masters</div>
            </div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialContent}>
              "Employee management has never been easier. The leave management and 
              performance review features are game-changers."
            </div>
            <div style={styles.testimonialAuthor}>
              <div style={styles.authorName}>Mary Wanjiku</div>
              <div style={styles.authorRole}>HR Manager, Global Logistics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>Powerful Features for Modern HR</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h3 style={styles.featureTitle}>Automated Payroll</h3>
            <p style={styles.featureText}>
              Automatically calculate PAYE, NHIF, and NSSF. Generate payslips and process 
              payments with just a few clicks.
            </p>
            <ul style={styles.featureList}>
              <li>Statutory deductions</li>
              <li>Bank transfers</li>
              <li>Digital payslips</li>
              <li>Payment history</li>
            </ul>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>👥</div>
            <h3 style={styles.featureTitle}>Employee Management</h3>
            <p style={styles.featureText}>
              Maintain digital employee records, track attendance, and manage leave requests 
              efficiently.
            </p>
            <ul style={styles.featureList}>
              <li>Employee profiles</li>
              <li>Leave management</li>
              <li>Document storage</li>
              <li>Attendance tracking</li>
            </ul>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Performance Reviews</h3>
            <p style={styles.featureText}>
              Set and track KPIs, conduct reviews, and monitor employee growth over time.
            </p>
            <ul style={styles.featureList}>
              <li>KPI tracking</li>
              <li>360° feedback</li>
              <li>Review cycles</li>
              <li>Development plans</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" style={styles.pricing}>
        <h2 style={styles.sectionTitle}>Simple, Transparent Pricing</h2>
        <div style={styles.pricingGrid}>
          <div style={styles.pricingCard}>
            <h3 style={styles.pricingTitle}>Starter</h3>
            <div style={styles.price}>KES 5,000<span style={styles.perMonth}>/month</span></div>
            <ul style={styles.pricingFeatures}>
              <li>Up to 10 employees</li>
              <li>Basic payroll processing</li>
              <li>Employee records</li>
              <li>Email support</li>
            </ul>
            <button 
              onClick={() => navigate('/register')} 
              style={styles.pricingButton}
            >
              Start Free Trial
            </button>
          </div>
          <div style={{...styles.pricingCard, ...styles.popularPlan}}>
            <div style={styles.popularTag}>Most Popular</div>
            <h3 style={styles.pricingTitle}>Professional</h3>
            <div style={styles.price}>KES 10,000<span style={styles.perMonth}>/month</span></div>
            <ul style={styles.pricingFeatures}>
              <li>Up to 50 employees</li>
              <li>Advanced payroll features</li>
              <li>Performance management</li>
              <li>Priority support</li>
              <li>Leave management</li>
              <li>Custom reports</li>
            </ul>
            <button 
              onClick={() => navigate('/register')} 
              style={{...styles.pricingButton, ...styles.popularButton}}
            >
              Start Free Trial
            </button>
          </div>
          <div style={styles.pricingCard}>
            <h3 style={styles.pricingTitle}>Enterprise</h3>
            <div style={styles.price}>Custom</div>
            <ul style={styles.pricingFeatures}>
              <li>Unlimited employees</li>
              <li>Full feature access</li>
              <li>Custom integrations</li>
              <li>24/7 support</li>
              <li>Dedicated account manager</li>
              <li>Custom workflows</li>
            </ul>
            <button 
              onClick={() => window.location.href = '#contact'} 
              style={styles.pricingButton}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" style={styles.contact}>
        <h2 style={styles.sectionTitle}>Get in Touch</h2>
        <div style={styles.contactContent}>
          <div style={styles.contactInfo}>
            <h3 style={styles.contactTitle}>Contact Information</h3>
            <p style={styles.contactText}>
              Have questions? Our team is here to help you choose the right plan for your business.
            </p>
            <div style={styles.contactDetails}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📧</span>
                <span>info@stafma.com</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📱</span>
                <span>+254 700 000 000</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📍</span>
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
          <div style={styles.officeHours}>
            <h3 style={styles.contactTitle}>Office Hours</h3>
            <p style={styles.contactText}>
              Monday - Friday: 8:00 AM - 6:00 PM<br />
              Saturday: 9:00 AM - 1:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>STAFMA</h3>
            <p style={styles.footerText}>
              Empowering Kenyan businesses with modern HR solutions. 
              Simplify your HR processes and focus on growing your business.
            </p>
          </div>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Quick Links</h3>
            <a href="#features" style={styles.footerLink}>Features</a>
            <a href="#pricing" style={styles.footerLink}>Pricing</a>
            <a href="#contact" style={styles.footerLink}>Contact</a>
          </div>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Legal</h3>
            <span style={styles.footerText}>Privacy Policy</span>
            <span style={styles.footerText}>Terms of Service</span>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} STAFMA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 5%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1e40af',
  },
  logoTagline: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: '#1e293b',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.3s',
    '&:hover': {
      color: '#2563eb',
    },
  },
  loginButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#1e3a8a',
      transform: 'translateY(-1px)',
    },
  },
  hero: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, #1e40af, #1e3a8a),
                radial-gradient(circle at top right, rgba(251, 191, 36, 0.1), transparent 400px)`,
    backgroundBlendMode: 'overlay',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 5% 4rem',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.1), transparent 70%)',
      pointerEvents: 'none',
    },
  },
  heroContent: {
    maxWidth: '900px',
  },
  heroTitle: {
    fontSize: '4.5rem',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
    lineHeight: '1.1',
    textAlign: 'center',
    position: 'relative',
    padding: '0 1rem',
  },
  revolutionize: {
    display: 'inline-block',
    background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    animation: 'shimmer 2s infinite linear',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-5px',
      left: '0',
      width: '100%',
      height: '3px',
      background: '#fbbf24',
      borderRadius: '2px',
    },
  },
  hrText: {
    display: 'inline-block',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      width: '20px',
      height: '20px',
      background: '#fbbf24',
      borderRadius: '50%',
      opacity: '0.3',
    },
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '-100% 0',
    },
    '100%': {
      backgroundPosition: '100% 0',
    },
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    marginBottom: '2.5rem',
    color: '#e2e8f0',
    lineHeight: '1.6',
    maxWidth: '800px',
    margin: '0 auto 2.5rem',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: '1',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem',
  },
  primaryButton: {
    padding: '1.2rem 2.5rem',
    backgroundColor: '#fbbf24',
    color: '#1e3a8a',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(251, 191, 36, 0.3)',
    '&:hover': {
      backgroundColor: '#f59e0b',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(251, 191, 36, 0.4)',
    },
  },
  secondaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid #fbbf24',
    borderRadius: '0.5rem',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      transform: 'translateY(-2px)',
    },
  },
  trustBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '0.75rem 1.5rem',
    borderRadius: '2rem',
    fontSize: '1rem',
    color: '#e2e8f0',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  features: {
    padding: '6rem 5%',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '3rem',
    color: '#1e293b',
    fontWeight: 'bold',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    },
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1e293b',
    fontWeight: '600',
  },
  featureText: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    color: '#64748b',
    '& li': {
      marginBottom: '0.5rem',
      paddingLeft: '1.5rem',
      position: 'relative',
      '&:before': {
        content: '"✓"',
        position: 'absolute',
        left: 0,
        color: '#fbbf24',
      },
    },
  },
  pricing: {
    padding: '6rem 5%',
    backgroundColor: '#f8fafc',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    position: 'relative',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  popularPlan: {
    border: '2px solid #fbbf24',
    transform: 'scale(1.05)',
  },
  popularTag: {
    position: 'absolute',
    top: '-1rem',
    right: '1rem',
    backgroundColor: '#fbbf24',
    color: '#1e3a8a',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  pricingTitle: {
    fontSize: '1.5rem',
    color: '#1e293b',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  price: {
    fontSize: '2.5rem',
    color: '#1e293b',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  perMonth: {
    fontSize: '1rem',
    color: '#64748b',
    fontWeight: 'normal',
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '2rem',
    '& li': {
      marginBottom: '0.8rem',
      color: '#64748b',
      paddingLeft: '1.5rem',
      position: 'relative',
      '&:before': {
        content: '"✓"',
        position: 'absolute',
        left: 0,
        color: '#fbbf24',
      },
    },
  },
  pricingButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#1e3a8a',
    },
  },
  popularButton: {
    backgroundColor: '#2563eb',
  },
  contact: {
    padding: '6rem 5%',
    backgroundColor: '#ffffff',
  },
  contactContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '4rem',
  },
  contactInfo: {
    color: '#1e293b',
  },
  contactTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1e293b',
    fontWeight: '600',
  },
  contactText: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  contactDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#64748b',
  },
  contactIcon: {
    fontSize: '1.2rem',
  },
  footer: {
    backgroundColor: '#1e3a8a',
    color: '#f8fafc',
    padding: '4rem 5% 2rem',
  },
  footerContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '4rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  footerTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  footerText: {
    color: '#cbd5e1',
    lineHeight: '1.6',
  },
  footerLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'color 0.3s',
    '&:hover': {
      color: '#60a5fa',
    },
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginTop: '3rem',
    paddingTop: '2rem',
    textAlign: 'center',
  },
  copyright: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  stats: {
    padding: '4rem 5%',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statCard: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: '0.5rem',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '1.1rem',
  },
  testimonials: {
    padding: '6rem 5%',
    backgroundColor: '#f8fafc',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  testimonialCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    },
  },
  testimonialContent: {
    fontSize: '1.1rem',
    color: '#1e293b',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1rem',
  },
  authorName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  authorRole: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
};

export default LandingPage; 