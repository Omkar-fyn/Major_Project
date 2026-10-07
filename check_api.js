const r = async () => { 
  try { 
    const res = await fetch('https://major-project-nu-rust.vercel.app/asset/6a7c93cd5590767aca70086a'); 
    const html = await res.text(); 
    const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]); 
    for (let s of scripts) { 
      const jsUrl = s.startsWith('http') ? s : 'https://major-project-nu-rust.vercel.app' + (s.startsWith('/') ? s : '/' + s); 
      const jsRes = await fetch(jsUrl); 
      const jsText = await jsRes.text(); 
      if (jsText.includes('onrender.com') || jsText.includes('localhost:5000')) { 
        console.log('Found API URL in', jsUrl, '->', jsText.match(/https?:\/\/[a-zA-Z0-9-.]+(api|render|vercel|localhost)[a-zA-Z0-9-.:]*/g)); 
      } 
    } 
  } catch (e) { 
    console.error(e) 
  } 
}; 
r();
