import React from 'react';
import { MdEmail, MdLocationOn, MdPhone, MdSchedule } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";


function Contact() {
  const contactInfo = {
    email: "tusharmotwani89@gmail.com",
    phone: "+91 9982780324",
    location: "Jaipur, Rajasthan, India",
    linkedin: "https://www.linkedin.com/in/tushar-motwani-89/",
    github: "https://github.com/tusharmotwani1718",
    twitter: "https://x.com/tushar_7181",
    instagram: ""
  };

  const availability = [
    { day: "Monday - Friday", time: "9:00 AM - 6:00 PM IST" },
    { day: "Saturday", time: "10:00 AM - 4:00 PM IST" },
    { day: "Sunday", time: "Closed" }
  ];

  const ContactCard = ({ icon, title, value, link, description, gradient }) => (
    <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-500 hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${gradient} border border-white/20 dark:border-dark-neutral/20`}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-3 sm:mb-4 md:mb-6">
          <div className="p-2 sm:p-3 md:p-4 rounded-full bg-white/20 dark:bg-black/20 text-white group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
            {title}
          </h3>
        </div>
        
        {link ? (
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-white/90 hover:text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-2 sm:mb-3 transition-colors duration-300 break-all hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-2 sm:mb-3 break-all">
            {value}
          </p>
        )}
        
        {description && (
          <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Decorative circles */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background dark:from-dark-background dark:via-dark-primary/5 dark:to-dark-background mx-auto w-full">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 dark:from-dark-primary dark:to-dark-primary/80 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight">
              Get In Touch
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Connect with me through any of these platforms. I'm always excited to discuss new opportunities and collaborations.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float hidden lg:block"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float-delayed hidden lg:block"></div>
      </div>

      {/* Contact Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {/* Email Card */}
          <ContactCard
            icon={<MdEmail className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
            title="Email"
            value={contactInfo.email}
            link={`mailto:${contactInfo.email}`}
            description="Drop me a line anytime. I usually respond within 24 hours."
            gradient="from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
          />

          {/* LinkedIn Card */}
          <ContactCard
            icon={<FaLinkedin className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
            title="LinkedIn"
            value="Connect with me on LinkedIn"
            link={contactInfo.linkedin}
            description="Let's connect and expand our professional network together."
            gradient="from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800"
          />

          {/* GitHub Card */}
          <ContactCard
            icon={<FaGithub className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
            title="GitHub"
            value="Check out my repositories"
            link={contactInfo.github}
            description="Explore my open-source projects and contributions."
            gradient="from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900"
          />

          {/* Phone Card */}
          <ContactCard
            icon={<MdPhone className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
            title="Phone"
            value={contactInfo.phone}
            link={`tel:${contactInfo.phone}`}
            description="Available during business hours for urgent matters."
            gradient="from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"
          />

          {/* Location Card */}
          <ContactCard
            icon={<MdLocationOn className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
            title="Location"
            value={contactInfo.location}
            description="Based in the Pink City of India, open to remote collaborations worldwide."
            gradient="from-red-500 to-red-600 dark:from-red-600 dark:to-red-700"
          />

          {/* Social Media Card */}
          <div className="md:col-span-2 xl:col-span-1">
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-500 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 border border-white/20 dark:border-dark-neutral/20">
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 md:p-4 rounded-full bg-white/20 dark:bg-black/20 text-white group-hover:scale-110 transition-transform duration-300">
                    <FaInstagram className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                    Social Media
                  </h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <a 
                    href={contactInfo.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors duration-300 group/link"
                  >
                    <FaXTwitter className="w-4 h-4 sm:w-5 sm:h-5 group-hover/link:scale-110 transition-transform duration-300" />
                    <span className="text-sm sm:text-base md:text-lg font-medium">Follow me on Twitter</span>
                  </a>
                  
                  <a 
                    href={contactInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors duration-300 group/link"
                  >
                    <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 group-hover/link:scale-110 transition-transform duration-300" />
                    <span className="text-sm sm:text-base md:text-lg font-medium">See my Instagram</span>
                  </a>
                </div>
                
                <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed mt-4 sm:mt-6">
                  Follow me for updates, insights, and behind-the-scenes content.
                </p>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-32">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-onBackground dark:text-dark-onBackground mb-4 sm:mb-6">
              Availability
            </h2>
            <p className="text-neutral dark:text-dark-neutral text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Here's when you can typically expect responses from me
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-on-primary dark:bg-dark-background rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-neutral/10 dark:border-dark-neutral/10">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 rounded-full bg-primary/20 dark:bg-dark-primary/20 text-primary dark:text-dark-primary">
                <MdSchedule className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-onBackground dark:text-dark-onBackground">
                Response Times
              </h3>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {availability.map((schedule, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg bg-primary/5 dark:bg-dark-primary/5">
                  <span className="font-semibold text-onBackground dark:text-dark-onBackground text-sm sm:text-base md:text-lg">
                    {schedule.day}
                  </span>
                  <span className="text-neutral dark:text-dark-neutral text-sm sm:text-base md:text-lg">
                    {schedule.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400 dark:border-blue-500">
              <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base leading-relaxed">
                <strong>Note:</strong> For urgent matters, please mention "URGENT" in your subject line. 
                I'll do my best to respond as quickly as possible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Contact;