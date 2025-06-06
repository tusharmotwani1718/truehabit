import React from 'react';
import { Mail } from 'lucide-react';
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className='mt-10 md:mt-20'>
      <div className="w-[95%] mx-auto px-4 sm:px-6 py-12 md:w-[90%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#260051] dark:text-[#7b44be]">trueHabit</h2>
            </div>
            <p className="text-sm mb-6">
              We're dedicated to providing the best experience for our users. Our mission is to create innovative solutions that make a difference.
            </p>
            <div className="flex space-x-4">
              <Link to="#" aria-label="Facebook" className="bg-primary text-on-primary dark:bg-dark-primary dark:text-dark-on-primary h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#E9DDFD] hover:text-[#260051] transition duration-300">
                <FaFacebook size={"16px"}/>
              </Link>
              <Link to="#" aria-label="Twitter" className=" bg-primary text-on-primary dark:bg-dark-primary dark:text-dark-on-primary h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#E9DDFD] hover:text-[#260051] transition duration-300">
                <FaLinkedin size={"16px"}/>
              </Link>
              <Link to="#" aria-label="Instagram" className=" bg-primary text-on-primary dark:bg-dark-primary dark:text-dark-on-primary h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#E9DDFD] hover:text-[#260051] transition duration-300">
                <FaXTwitter size={"16px"}/>
              </Link>
              <Link to="#" aria-label="LinkedIn" className=" bg-primary text-on-primary dark:bg-dark-primary dark:text-dark-on-primary h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#E9DDFD] hover:text-[#260051] transition duration-300">
                <FaGithub size={"16px"}/>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#260051] dark:text-[#7b44be]">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Services</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Products</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Blog</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#260051] dark:text-[#7b44be]">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Documentation</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Help Center</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Tutorials</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">API Reference</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-dark-primary transition duration-300">Community</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#260051] dark:text-[#7b44be]">Stay Updated</h3>
            <p className="mb-4 text-sm">Subscribe to our newsletter to get the latest updates and news.</p>
            <form className="flex flex-col space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="pl-10 pr-4 py-2 w-full rounded bg-white border border-[#E9DDFD] focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary dark:text-onBackgorund"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded font-medium bg-[#E9DDFD] text-[#260051] dark:text-[#7b44be] hover:bg-[#260051] hover:text-[#E9DDFD] dark:hover:bg-[#7b44be] transition duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-[#E9DDFD]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2025 Company Name. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="#" className="text-sm hover:text-primary dark:hover:text-dark-primary transition duration-300">Privacy Policy</Link>
              <Link to="#" className="text-sm hover:text-primary dark:hover:text-dark-primary transition duration-300">Terms of Service</Link>
              <Link to="#" className="text-sm hover:text-primary dark:hover:text-dark-primary transition duration-300">Cookies Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;