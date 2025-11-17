"use client";

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { sanitizeHTML } from '@/utils/sanitize';

interface BlogContentRendererProps {
  content: string;
}

const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const contentIdRef = useRef<string>(`blog-content-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (contentRef.current && content) {
      try {
        // Try to parse as Editor.js JSON format
        const editorData = JSON.parse(content);
        
        if (editorData.blocks && Array.isArray(editorData.blocks)) {
          // Render Editor.js blocks
          renderEditorBlocks(contentRef.current, editorData.blocks);
        } else {
          // Treat as HTML
          handleHTMLContent(content);
        }
      } catch (error) {
        // Not JSON, treat as HTML
        handleHTMLContent(content);
      }
    }

    // Cleanup function to remove injected styles
    return () => {
      document.querySelectorAll(`style[data-blog-content="${contentIdRef.current}"]`).forEach(el => el.remove());
    };
  }, [content]);

  const handleHTMLContent = (htmlContent: string) => {
    if (!contentRef.current) return;

    const contentId = contentIdRef.current;
    
    // Set the unique ID on the container
    contentRef.current.id = contentId;

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHTML(htmlContent);
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    
    // Extract and remove style tags
    const styleTags = tempDiv.querySelectorAll('style');
    
    // Remove any previously injected styles with this ID
    document.querySelectorAll(`style[data-blog-content="${contentId}"]`).forEach(el => el.remove());
    
    // Inject scoped styles into document head
    styleTags.forEach((styleTag) => {
      let cssText = styleTag.textContent || '';
      
      // Scope the CSS to the container ID
      // This regex matches CSS selectors and prepends the container ID
      cssText = cssText.replace(/([^{}@]+){/g, (match, selector) => {
        // Skip @media and other @rules
        if (selector.trim().startsWith('@')) {
          return match;
        }
        
        // Clean the selector and prepend the container ID
        const cleanSelector = selector.trim();
        // Don't double-scope if already scoped
        if (cleanSelector.includes(`#${contentId}`)) {
          return match;
        }
        
        // Handle comma-separated selectors
        const scopedSelectors = cleanSelector.split(',').map((s: string) => 
          `#${contentId} ${s.trim()}`
        ).join(', ');
        
        return `${scopedSelectors} {`;
      });
      
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-blog-content', contentId);
      styleElement.textContent = cssText;
      document.head.appendChild(styleElement);
    });
    
    // Remove style tags from the content to avoid duplication
    styleTags.forEach(tag => tag.remove());
    
    // Set the HTML content without style tags
    contentRef.current.innerHTML = tempDiv.innerHTML;
  };

  const renderEditorBlocks = (container: HTMLElement, blocks: any[]) => {
    container.innerHTML = '';
    
    blocks.forEach((block) => {
      const element = document.createElement('div');
      element.className = 'editor-block';
      
      switch (block.type) {
        case 'header':
          const headerTag = `h${block.data.level || 2}`;
          const header = document.createElement(headerTag);
          header.textContent = block.data.text;
          header.style.fontWeight = '600';
          header.style.marginBottom = '16px';
          header.style.marginTop = '24px';
          element.appendChild(header);
          break;
          
        case 'paragraph':
          const paragraph = document.createElement('p');
          paragraph.innerHTML = sanitizeHTML(block.data.text);
          paragraph.style.marginBottom = '16px';
          paragraph.style.lineHeight = '1.6';
          element.appendChild(paragraph);
          break;
          
        case 'list':
          const list = document.createElement(block.data.style === 'ordered' ? 'ol' : 'ul');
          list.style.marginBottom = '16px';
          list.style.paddingLeft = '24px';
          
          block.data.items.forEach((item: string) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = sanitizeHTML(item);
            listItem.style.marginBottom = '8px';
            list.appendChild(listItem);
          });
          
          element.appendChild(list);
          break;
          
        case 'quote':
          const quote = document.createElement('blockquote');
          quote.style.borderLeft = '4px solid #007AFF';
          quote.style.paddingLeft = '16px';
          quote.style.margin = '16px 0';
          quote.style.fontStyle = 'italic';
          quote.style.color = '#666';
          
          const quoteText = document.createElement('p');
          quoteText.innerHTML = sanitizeHTML(block.data.text);
          quote.appendChild(quoteText);
          
          if (block.data.caption) {
            const caption = document.createElement('cite');
            caption.textContent = `— ${block.data.caption}`;
            caption.style.display = 'block';
            caption.style.marginTop = '8px';
            caption.style.fontSize = '0.9em';
            quote.appendChild(caption);
          }
          
          element.appendChild(quote);
          break;
          
        case 'code':
          const codeContainer = document.createElement('div');
          codeContainer.style.backgroundColor = '#f5f5f5';
          codeContainer.style.padding = '16px';
          codeContainer.style.borderRadius = '8px';
          codeContainer.style.margin = '16px 0';
          codeContainer.style.fontFamily = 'monospace';
          codeContainer.style.overflow = 'auto';
          
          const code = document.createElement('pre');
          code.textContent = block.data.code;
          codeContainer.appendChild(code);
          
          element.appendChild(codeContainer);
          break;
          
        case 'image':
          const imageContainer = document.createElement('div');
          imageContainer.style.textAlign = 'center';
          imageContainer.style.margin = '24px 0';
          
          const image = document.createElement('img');
          image.src = block.data.file?.url || block.data.url;
          image.alt = block.data.caption || '';
          image.style.maxWidth = '100%';
          image.style.height = 'auto';
          image.style.borderRadius = '8px';
          
          imageContainer.appendChild(image);
          
          if (block.data.caption) {
            const caption = document.createElement('p');
            caption.textContent = block.data.caption;
            caption.style.marginTop = '8px';
            caption.style.fontSize = '0.9em';
            caption.style.color = '#666';
            caption.style.fontStyle = 'italic';
            imageContainer.appendChild(caption);
          }
          
          element.appendChild(imageContainer);
          break;
          
        case 'delimiter':
          const delimiter = document.createElement('hr');
          delimiter.style.margin = '32px 0';
          delimiter.style.border = 'none';
          delimiter.style.borderTop = '2px solid #e0e0e0';
          element.appendChild(delimiter);
          break;
          
        case 'table':
          const tableContainer = document.createElement('div');
          tableContainer.style.overflow = 'auto';
          tableContainer.style.margin = '16px 0';
          
          const table = document.createElement('table');
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.border = '1px solid #ddd';
          
          block.data.content.forEach((row: string[], rowIndex: number) => {
            const tr = document.createElement('tr');
            
            row.forEach((cell: string, cellIndex: number) => {
              const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
              td.textContent = cell;
              td.style.border = '1px solid #ddd';
              td.style.padding = '8px 12px';
              td.style.textAlign = 'left';
              
              if (rowIndex === 0) {
                td.style.backgroundColor = '#f5f5f5';
                td.style.fontWeight = '600';
              }
              
              tr.appendChild(td);
            });
            
            table.appendChild(tr);
          });
          
          tableContainer.appendChild(table);
          element.appendChild(tableContainer);
          break;
          
        default:
          // Fallback for unknown block types
          const fallback = document.createElement('div');
          fallback.textContent = JSON.stringify(block.data);
          fallback.style.padding = '16px';
          fallback.style.backgroundColor = '#f9f9f9';
          fallback.style.borderRadius = '4px';
          fallback.style.margin = '8px 0';
          element.appendChild(fallback);
      }
      
      container.appendChild(element);
    });
  };

  return (
    <Box
      ref={contentRef}
      sx={{
        // Scoped container to prevent global CSS from affecting page
        position: 'relative',
        minHeight: '100px',
        width: '100%',
        '& *': {
          boxSizing: 'border-box',
        },
            '& .editor-block': {
              marginBottom: '16px',
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontWeight: 600,
              marginBottom: '16px',
              marginTop: '24px',
              '&:first-of-type': {
                marginTop: 0,
              },
            },
            '& p': {
              marginBottom: '16px',
              lineHeight: 1.6,
            },
            '& ul, & ol': {
              marginBottom: '16px',
              paddingLeft: '24px',
            },
            '& li': {
              marginBottom: '8px',
            },
            '& blockquote': {
              borderLeft: '4px solid #007AFF',
              paddingLeft: '16px',
              margin: '16px 0',
              fontStyle: 'italic',
              color: '#666',
            },
            '& pre': {
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              margin: '16px 0',
              fontFamily: 'monospace',
              overflow: 'auto',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
            },
            '& hr': {
              margin: '32px 0',
              border: 'none',
              borderTop: '2px solid #e0e0e0',
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
              margin: '16px 0',
            },
            '& th, & td': {
              border: '1px solid #ddd',
              padding: '8px 12px',
              textAlign: 'left',
            },
            '& th': {
              backgroundColor: '#f5f5f5',
              fontWeight: 600,
            },
      }}
    />
  );
};

export default BlogContentRenderer;
