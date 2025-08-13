// Define base URL at the top level
const baseUrl = window.location.pathname.includes('/games/') ? '..' : '.';

// Function to load head content
async function loadHeadContent() {
  try {
    
    // Store any existing page-specific stylesheets
    const pageStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => {
      const elem = link.cloneNode(true);
      link.remove();
      return elem;
    });
    
    // Fetch the head content
    const response = await fetch(`${baseUrl}/head.html`);
    const headContent = await response.text();
    
    // Create a temporary container and fill it with the head content
    const temp = document.createElement('div');
    temp.innerHTML = headContent;
    
    // Fix paths based on current page location
    const elements = temp.querySelectorAll('link[href], script[src], img[src]');
    elements.forEach(el => {
      const attr = el.hasAttribute('href') ? 'href' : 'src';
      if (el[attr].startsWith('/')) {
        el[attr] = `${baseUrl}${el[attr]}`;
      }
    });
    
    // Insert each element from the head template
    Array.from(temp.children).forEach(el => {
      // Skip if element with same href/src already exists
      const attr = el.hasAttribute('href') ? 'href' : 'src';
      const existing = document.querySelector(`[${attr}="${el[attr]}"]`);
      if (!existing) {
        document.head.appendChild(el);
      }
    });

    // Re-add page-specific stylesheets after shared content
    pageStyles.forEach(style => {
      document.head.appendChild(style);
    });

  } catch (error) {
    console.error('Error loading head content:', error);
  }
}

// Load head content when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadHeadContent();
    // Load ad-loader script
    const adScript = document.createElement('script');
    adScript.src = `${baseUrl}/scripts/ad-loader.js`;
    document.head.appendChild(adScript);
  });
} else {
  loadHeadContent();
  // Load ad-loader script
  const adScript = document.createElement('script');
  adScript.src = `${baseUrl}/scripts/ad-loader.js`;
  document.head.appendChild(adScript);
}
