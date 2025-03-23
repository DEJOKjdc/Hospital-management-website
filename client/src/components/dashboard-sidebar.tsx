import { useState } from "react";

type SidebarLink = {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

type DashboardSidebarProps = {
  links: SidebarSection[];
};

export const DashboardSidebar = ({ links }: DashboardSidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="bg-dark text-white w-64 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold">MediCare</h2>
          <p className="text-gray-400 text-sm">Hospital Management System</p>
        </div>
        
        <nav className="mt-6">
          {links.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="px-4 py-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{section.title}</p>
              </div>
              
              {section.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    link.onClick();
                  }}
                  className={`block px-4 py-3 flex items-center ${
                    link.active ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.text}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-dark text-white flex items-center justify-between p-4 z-10">
        <div>
          <h2 className="text-xl font-bold">MediCare</h2>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-700"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-20">
          <div className="bg-dark text-white h-full w-64 pt-16">
            <nav className="mt-4">
              {links.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{section.title}</p>
                  </div>
                  
                  {section.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        link.onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block px-4 py-3 flex items-center ${
                        link.active ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {link.icon}
                      {link.text}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark text-white flex justify-around py-3 z-10">
        {links.flatMap(section => section.links).slice(0, 4).map((link, linkIndex) => (
          <a
            key={linkIndex}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              link.onClick();
            }}
            className={`text-center px-4 py-2 rounded flex flex-col items-center ${
              link.active ? 'bg-blue-800' : ''
            }`}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.text}</span>
          </a>
        ))}
      </div>
      
      {/* Additional padding for mobile to account for the bottom navigation */}
      <div className="md:hidden h-16 w-full"></div>
    </>
  );
};
