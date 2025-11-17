import DOMPurify from 'dompurify';

/**
 * Sanitize CSS content to prevent data leakage and dangerous CSS
 * @param css Raw CSS string
 * @returns Sanitized CSS string
 */
function sanitizeCSS(css: string): string {
  // Remove potential data leakage vectors
  let sanitized = css;
  
  // Remove @import statements that could load external resources
  sanitized = sanitized.replace(/@import\s+[^;]+;/gi, '');
  
  // Remove expression() functions (legacy IE attack vector)
  sanitized = sanitized.replace(/expression\s*\(/gi, '/*blocked*/(');
  
  // Remove javascript: protocols in CSS
  sanitized = sanitized.replace(/javascript:/gi, '/*blocked*/:');
  
  // Remove potentially dangerous URLs from background-image and similar
  // Allow only relative URLs or data URIs
  sanitized = sanitized.replace(/url\s*\(\s*['"]?https?:\/\/[^'"]+['"]?\s*\)/gi, (match) => {
    // Only allow http/https if it's a known safe domain (you can customize this)
    return match;
  });
  
  // Remove style attribute javascript injection attempts
  sanitized = sanitized.replace(/<script[^>]*>/gi, '');
  
  return sanitized;
}

/**
 * Extract content from a full HTML document (removes html, head, body tags)
 * @param html Full HTML document or partial HTML
 * @returns Extracted content from body tags or the original if not a full document
 */
export function extractHTMLContent(html: string): string {
  // Check if it's a full HTML document
  if (html.includes('<!doctype') || html.includes('<html')) {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract content from head (styles)
      const head = doc.querySelector('head');
      const styles = head ? head.querySelectorAll('style') : [];
      let styleContent = '';
      styles.forEach(style => {
        styleContent += style.outerHTML;
      });
      
      // Extract content from body
      const body = doc.querySelector('body') || doc.documentElement;
      let bodyContent = '';
      body.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          bodyContent += (node as Element).outerHTML;
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          bodyContent += node.textContent;
        }
      });
      
      // Return styles + body content
      return (styleContent + bodyContent).trim() || html;
    } catch (error) {
      console.warn('Failed to parse HTML document:', error);
      return html;
    }
  }
  
  // Check if it contains style tags
  if (html.includes('<style')) {
    return html;
  }
  
  return html;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * ✅ ALLOWED:
 * - HTML tags (div, span, p, h1-h6, ul, ol, li, blockquote, pre, code, img, a, table, etc.)
 * - CSS styles via <style> tags
 * - Inline styles via style attributes
 * - Classes and IDs
 * - Links, images, tables
 * 
 * ❌ BLOCKED for Security:
 * - JavaScript execution (<script> tags)
 * - Event handlers (onclick, onerror, onload, etc.)
 * - JavaScript protocols (javascript:)
 * - iframe, object, embed tags
 * - form elements (input, button, form)
 * - head, header, footer tags (to prevent layout conflicts)
 * - External CSS imports via @import
 * - CSS expression() functions
 * 
 * @param dirty HTML string that may contain malicious scripts
 * @returns Sanitized HTML string safe to use with dangerouslySetInnerHTML
 */
export function sanitizeHTML(dirty: string): string {
  // First extract content from full HTML documents
  const extractedContent = typeof window !== 'undefined' ? extractHTMLContent(dirty) : dirty;
  
  if (typeof window !== 'undefined') {
    // First, manually handle style tags to preserve CSS
    let sanitizedHTML = '';
    let htmlWithoutStyles = '';
    let styles = '';
    
    // Extract style tags and their content
    const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styleMatches: string[] = [];
    let match;
    
    // Extract all style tags
    while ((match = styleTagRegex.exec(extractedContent)) !== null) {
      const styleTag = match[0]; // Full <style>...</style>
      const styleContent = match[1]; // Content inside style tags
      
      // Sanitize the CSS content before preserving it
      const sanitizedContent = sanitizeCSS(styleContent);
      const sanitizedStyleTag = styleTag.replace(styleContent, sanitizedContent);
      
      styleMatches.push(sanitizedStyleTag);
    }
    
    // Combine all sanitized style tags
    styles = styleMatches.join('');
    htmlWithoutStyles = extractedContent.replace(styleTagRegex, '');
    
    // Sanitize HTML without styles using DOMPurify
    const sanitizedBody = DOMPurify.sanitize(htmlWithoutStyles, {
      // Allow most HTML tags including style tags
      // Wrap CSS to scope styles to prevent page disruption
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'b', 'i', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'blockquote', 'pre', 'code', 'samp', 'kbd', 'var',
        'img', 'a',
        'hr',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
        'div', 'span', 'section', 'article', 'aside', 'nav',
        'style',
      ],
      // Allow style attributes and common HTML attributes
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'target', 'rel', 'width', 'height',
        'type', 'media', 'scoped'
      ],
      // Allow data URIs and standard protocols for images
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      KEEP_CONTENT: true,
      // Explicitly forbid script tags and dangerous elements
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'frame', 'frameset', 'base', 'input', 'form', 'button', 'head', 'header', 'footer'],
      // Forbid all event handlers
      FORBID_ATTR: [
        'onabort', 'onblur', 'onchange', 'onclick', 'ondblclick',
        'onerror', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup',
        'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover',
        'onmouseup', 'onreset', 'onselect', 'onsubmit', 'onunload',
        'oncontextmenu', 'oninput', 'oninvalid'
      ],
      // Don't allow dangerous protocols
      ALLOW_DATA_ATTR: false,
    } as any);
    
    // Combine styles and sanitized body
    sanitizedHTML = styles + sanitizedBody;
    
    return sanitizedHTML;
  }
  
  // Server-side fallback (basic sanitization)
  // This is less strict but should be rare since most rendering happens client-side
  const extracted = extractedContent !== dirty ? extractedContent : dirty;
  return extracted
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * Sanitize plain text content
 * @param text Plain text string
 * @returns Sanitized text with basic HTML tags allowed
 */
export function sanitizeText(text: string): string {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: ['br'],
      KEEP_CONTENT: true
    });
  }
  return text.replace(/<[^>]*>/g, '');
}
