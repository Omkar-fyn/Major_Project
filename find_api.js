const https = require('https');

async function findApiUrl() {
  try {
    const fetch = (url) => new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    const html = await fetch('https://major-project-nu-rust.vercel.app/asset/6a7c93cd5590767aca70086a');
    
    // Find script tags
    const scriptRegex = /<script[^>]+src="([^"]+\.js)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1]);
    }

    console.log(`Found ${scripts.length} scripts`);
    
    for (let s of scripts) {
      const jsUrl = s.startsWith('http') ? s : 'https://major-project-nu-rust.vercel.app' + (s.startsWith('/') ? s : '/' + s);
      const jsContent = await fetch(jsUrl);
      
      // Look for string literals resembling URLs with /api
      const urlRegex = /"https?:\/\/[a-zA-Z0-9-.]+(api|render|vercel|localhost|onrender)[a-zA-Z0-9-.:/]*"/g;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(jsContent)) !== null) {
        console.log(`FOUND POTENTIAL API URL in ${jsUrl}: ${urlMatch[0]}`);
      }
    }
  } catch(e) {
    console.error(e);
  }
}

findApiUrl();
