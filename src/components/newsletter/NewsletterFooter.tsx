
import React from "react";

const NewsletterFooter = () => {
  return (
    <footer className="py-12 bg-navy-dark text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-serif font-black mb-2">
              <span className="underline-red">Churn</span> Is Dead
            </h2>
            <p className="text-sm text-gray-300">
              © 2025 Churn Is Dead. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewsletterFooter;
