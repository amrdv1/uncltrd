const fs = require('fs');
const content = fs.readFileSync('src/app/(main)/article/[slug]/page.tsx', 'utf-8');

function checkBalance(text) {
  const stack = [];
  let line = 1;
  const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    // update line number
    const substr = text.substring(0, match.index);
    line = substr.split('\n').length;
    
    const tag = match[1];
    const fullTag = match[0];
    
    // ignore self-closing tags
    if (fullTag.match(/\/>$/) || tag.toLowerCase() === 'img' || tag.toLowerCase() === 'br' || tag.toLowerCase() === 'hr' || tag.toLowerCase() === 'input') {
      continue;
    }
    
    if (fullTag.startsWith('</')) {
      if (stack.length === 0) {
        console.log(`Extra closing tag: ${fullTag} at line ${line}`);
      } else {
        const last = stack.pop();
        if (last.tag !== tag) {
          console.log(`Mismatch: Expected </${last.tag}> but got ${fullTag} at line ${line}`);
        }
      }
    } else {
      stack.push({ tag, line });
    }
  }
  
  if (stack.length > 0) {
    console.log(`Unclosed tags: ${stack.map(s => `<${s.tag}> (line ${s.line})`).join(', ')}`);
  } else {
    console.log("All tags balanced.");
  }
}

// Extract the return block of the first component (the ArticlePage function return)
const returnStart = content.indexOf('return (\n      <div className="bg-white dark:bg-[#050505]');
const returnEnd = content.lastIndexOf('    );\n  }\n\n  return ('); // end of first block
if (returnStart > -1 && returnEnd > -1) {
  checkBalance(content.substring(returnStart, returnEnd));
} else {
  console.log("Could not extract block.");
}
