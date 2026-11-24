function parseUrls(input){
  const urls=[];const locRe=/<loc>\s*([^<\s]+)\s*<\/loc>/gi;let m;
  while((m=locRe.exec(input)))urls.push(m[1]);
  if(!urls.length)input.split(/\s+/).forEach(u=>{if(/^https?:\/\//i.test(u))urls.push(u.trim())});
  return [...new Set(urls)];
}
function titleFromUrl(u){
  try{const p=new URL(u).pathname.replace(/\/$/,'').split('/').filter(Boolean);
    if(!p.length)return 'Home';
    return decodeURIComponent(p[p.length-1]).replace(/\.(html?|php)$/,'').replace(/[-_]+/g,' ').replace(/^\w/,c=>c.toUpperCase());}catch(e){return u}
}
function sectionFor(u){
  try{const p=new URL(u).pathname.split('/').filter(Boolean);return p.length>1?p[0].replace(/[-_]+/g,' ').replace(/^\w/,c=>c.toUpperCase()):'Main pages';}catch(e){return 'Other'}
}
function buildLlmsTxt({name,summary,details,urls,optional=[]}){
  const groups={};
  urls.forEach(u=>{const s=optional.some(o=>u.includes(o))?'Optional':sectionFor(u);(groups[s]=groups[s]||[]).push(u)});
  const order=Object.keys(groups).filter(k=>k!=='Optional').sort((a,b)=>a==='Main pages'?-1:b==='Main pages'?1:a.localeCompare(b));
  if(groups.Optional)order.push('Optional');
  let out=`# ${name||'Your site'}\n\n> ${summary||'One sentence on what this site is and who it is for.'}\n`;
  if(details)out+=`\n${details}\n`;
  for(const s of order){out+=`\n## ${s}\n\n`+groups[s].map(u=>`- [${titleFromUrl(u)}](${u})`).join('\n')+'\n';}
  return out;
}
const AI_CRAWLERS=[
  ['GPTBot','OpenAI, model training'],['OAI-SearchBot','OpenAI, ChatGPT search results'],['ChatGPT-User','OpenAI, fetches a page when a user asks'],
  ['ClaudeBot','Anthropic, model training'],['Claude-SearchBot','Anthropic, search'],['Claude-User','Anthropic, fetches a page when a user asks'],
  ['PerplexityBot','Perplexity, search index'],['Perplexity-User','Perplexity, fetches when a user asks'],
  ['Google-Extended','Google, Gemini training (not Search)'],['Applebot-Extended','Apple, AI training'],['CCBot','Common Crawl, used by many models']
];
function robotsBlock(allow){return AI_CRAWLERS.map(([b])=>`User-agent: ${b}\n${allow[b]===false?'Disallow: /':'Allow: /'}`).join('\n\n')+'\n';}
if(typeof module!=='undefined')module.exports={parseUrls,buildLlmsTxt,robotsBlock,AI_CRAWLERS,titleFromUrl};
