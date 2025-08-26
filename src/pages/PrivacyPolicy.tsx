import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Mail, Database, Globe, Heart } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import LaserRaveBackground from "@/components/LaserRaveBackground";

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "information-collection",
      icon: <Eye className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account & Profile Data",
          items: [
            "Username, email, and profile information",
            "Dance preferences, skill level, and favorite genres",
            "Profile photos and bio information"
          ]
        },
        {
          subtitle: "Activity & Content Data",
          items: [
            "Shuffle logs, dance session recordings, and progress tracking",
            "Video uploads, festival recaps, and creative remixes",
            "Event participation and festival planning data"
          ]
        },
        {
          subtitle: "Device & Usage Data",
          items: [
            "Device information, IP address, and browser type",
            "App usage patterns and feature interactions",
            "Performance metrics and crash reports"
          ]
        },
        {
          subtitle: "Third-Party Integrations",
          items: [
            "Social media connections (optional)",
            "Festival calendar integrations",
            "Affiliate link interactions and purchases"
          ]
        }
      ]
    },
    {
      id: "information-usage",
      icon: <Database className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Personalization",
          items: [
            "AI-powered shuffle analysis and feedback",
            "Personalized gear recommendations and tutorials",
            "Festival outfit suggestions based on your style"
          ]
        },
        {
          subtitle: "Community Features",
          items: [
            "Leaderboards and achievement tracking",
            "Social connections and dance challenges",
            "Content sharing and remix collaborations"
          ]
        },
        {
          subtitle: "Platform Improvement",
          items: [
            "Usage analytics and feature optimization",
            "Bug fixes and performance enhancements",
            "New feature development based on user feedback"
          ]
        }
      ]
    },
    {
      id: "content-sharing",
      icon: <Globe className="w-6 h-6" />,
      title: "Content You Share",
      content: [
        {
          subtitle: "Your Rights",
          items: [
            "You own all content you create and upload",
            "You control privacy settings for your posts",
            "You can delete your content at any time"
          ]
        },
        {
          subtitle: "Licensing for Features",
          description: "When you share content publicly, you grant EDM Shuffle a limited license to:",
          items: [
            "Display your content in highlights and leaderboards",
            "Feature exceptional shuffles in community showcases",
            "Include your work in educational content or tutorials"
          ]
        },
        {
          subtitle: "Content Guidelines",
          items: [
            "Upload only original content or material under Fair Use",
            "Respect copyright and intellectual property rights",
            "Follow community guidelines for appropriate content"
          ]
        }
      ]
    },
    {
      id: "ai-analytics",
      icon: <Shield className="w-6 h-6" />,
      title: "AI & Analytics",
      description: "We use advanced AI to enhance your experience:",
      content: [
        {
          items: [
            "Dance Analysis: AI-powered feedback on shuffle techniques and flow",
            "Personalization: Smart recommendations for gear, music, and events",
            "Content Moderation: Automated detection of inappropriate content",
            "Performance Tracking: Anonymous usage analytics to improve the platform"
          ]
        }
      ]
    },
    {
      id: "data-security",
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security & Privacy",
      content: [
        {
          subtitle: "Your Control",
          items: [
            "Complete account data export available",
            "Account deletion with full data removal",
            "Marketing communication preferences",
            "Privacy settings for content visibility"
          ]
        },
        {
          subtitle: "Security Measures",
          items: [
            "End-to-end encryption for sensitive data",
            "Regular security audits and updates",
            "Secure authentication and session management"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <LaserRaveBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-bass-dark/90 via-bass-dark/80 to-bass-dark" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 px-4 py-6 border-b border-neon-purple/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-neon-cyan transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-purple" />
            <span className="text-sm text-slate-400">Privacy Protected</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Title Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-clip-text animate-shimmer">
              EDM Shuffle
            </span>
            <span className="text-white block text-3xl md:text-4xl mt-2">
              Privacy Policy
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <span className="text-sm">Effective Date: January 1, 2025</span>
            <span className="text-xs">•</span>
            <span className="text-sm">Version 1.0</span>
          </div>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          className="bg-bass-medium/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-neon-purple/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-3xl">🎉</span>
            Welcome to EDM Shuffle
          </h2>
          <p className="text-slate-300 leading-relaxed">
            EDM Shuffle is your ultimate platform for tracking dance journeys, preparing for festivals, 
            and connecting with the global electronic music community. We are committed to protecting 
            your privacy while providing an electrifying experience that celebrates creativity, 
            movement, and music.
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.section
            key={section.id}
            className="mb-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-neon-purple/20 rounded-lg text-neon-purple">
                {section.icon}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {section.title}
              </h2>
            </div>

            {section.description && (
              <p className="text-slate-300 mb-4 leading-relaxed">
                {section.description}
              </p>
            )}

            {section.content.map((contentBlock, blockIndex) => (
              <div key={blockIndex} className="mb-6">
                {contentBlock.subtitle && (
                  <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                    {contentBlock.subtitle}
                  </h3>
                )}
                {contentBlock.description && (
                  <p className="text-slate-300 mb-3">
                    {contentBlock.description}
                  </p>
                )}
                <ul className="space-y-2">
                  {contentBlock.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-slate-300"
                    >
                      <span className="text-neon-purple mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.section>
        ))}

        {/* Age Restrictions */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-neon-purple/20 rounded-lg">
              <span className="text-2xl">🎵</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Age Restrictions & Content
            </h2>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-neon-purple mt-1">•</span>
              <span><strong className="text-white">Age 18+:</strong> Platform intended for adult users</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-neon-purple mt-1">•</span>
              <span><strong className="text-white">NSFW Content:</strong> Some content may include mature themes</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-neon-purple mt-1">•</span>
              <span><strong className="text-white">Content Filters:</strong> Customizable visibility settings available</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-neon-purple mt-1">•</span>
              <span><strong className="text-white">Parental Controls:</strong> Family sharing options for younger users</span>
            </li>
          </ul>
        </motion.section>

        {/* Third-Party Services */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-neon-purple/20 rounded-lg">
              <span className="text-2xl">🤝</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Third-Party Services
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                Affiliate Partnerships
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Commission-earning affiliate links for gear and tickets</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Transparent disclosure of affiliate relationships</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>No impact on your shopping experience</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                Festival Integrations
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Direct connections to ticketing platforms</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Calendar synchronization services</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Social media platform integrations</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Fair Use & Copyright */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-neon-purple/20 rounded-lg">
              <span className="text-2xl">⚖️</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Fair Use & Copyright
            </h2>
          </div>
          <p className="text-slate-300 mb-6">
            EDM Shuffle celebrates creative expression and remix culture:
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                What We Support
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Original dance tutorials and shuffle breakdowns</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Festival fan videos and commentary</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Creative remixes and mashups</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Educational content and transformative works</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                Copyright Respect
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Full compliance with DMCA takedown procedures</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Fair Use guidelines for educational content</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Respect for artist and label rights</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Immediate response to copyright concerns</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Contact & Updates */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-neon-purple/20 rounded-lg text-neon-purple">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Contact & Updates
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                Get In Touch
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span><strong className="text-white">Email:</strong> privacy@edmshuffle.com</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span><strong className="text-white">In-App:</strong> Settings → Privacy → Contact Us</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span><strong className="text-white">Response Time:</strong> Within 48 hours for urgent privacy concerns</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-neon-cyan mb-3">
                Policy Changes
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>Clear notifications for significant updates</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>30-day notice for material changes</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-neon-purple mt-1">•</span>
                  <span>User consent for major policy modifications</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Closing Statement */}
        <motion.div
          className="bg-gradient-to-r from-neon-purple/10 via-neon-cyan/10 to-neon-purple/10 rounded-2xl p-8 text-center mb-12 border border-neon-purple/20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-neon-pink animate-pulse" />
            <h2 className="text-2xl font-bold text-white">
              Your Privacy, Your Experience
            </h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            At EDM Shuffle, we believe privacy and creativity go hand in hand. 
            We're committed to protecting your personal information while providing 
            the tools and community you need to express yourself through dance and music.
          </p>
          <p className="text-xl text-white font-semibold">
            Thank you for being part of the EDM Shuffle community! 🕺💫
          </p>
        </motion.div>

        {/* Links to Other Policies */}
        <motion.div
          className="text-center text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            For full details, visit our{" "}
            <Link to="/terms-of-service" className="text-neon-cyan hover:text-neon-purple transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/community-guidelines" className="text-neon-cyan hover:text-neon-purple transition-colors">
              Community Guidelines
            </Link>
            .
          </p>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-neon-purple/50 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default PrivacyPolicy;
