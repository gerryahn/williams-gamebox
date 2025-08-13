// Function to load AdSense ads
async function loadAds() {
    try {
        // First, ensure the AdSense script is loaded
        if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
            const adScript = document.createElement('script');
            adScript.async = true;
            adScript.crossOrigin = "anonymous";
            adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1978438658962872";
            document.head.appendChild(adScript);
        }

        // Fetch the ad unit HTML
        const response = await fetch('/ads/adsense-unit.html');
        const adHtml = await response.text();

        // Insert ads into all ad placeholders
        document.querySelectorAll('.ad').forEach(adContainer => {
            adContainer.innerHTML = adHtml;
        });

    } catch (error) {
        console.error('Error loading ads:', error);
    }
}

// Load ads when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAds);
} else {
    loadAds();
}
