"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import { sanitizeHTML } from '@/utils/sanitize';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Title,
  Link,
  Image,
  MoreVert,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from '@mui/icons-material';

interface EditorComponentProps {
  data?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const EditorComponent: React.FC<EditorComponentProps> = ({
  data = '',
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(data);
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromProps = useRef(false);

  // Initialize content when component mounts
  useEffect(() => {
    if (editorRef.current) {
      if (data) {
        // Sanitize external data before rendering in editor
        editorRef.current.innerHTML = sanitizeHTML(data);
        setContent(data);
      } else {
        editorRef.current.innerHTML = '';
        setContent('');
      }
    }
  }, []);

  useEffect(() => {
    // Only update from props if we're not currently updating from user input
    if (!isUpdatingFromProps.current && editorRef.current && data && data !== content) {
      // Only update if the content is significantly different
      // This prevents re-rendering on every keystroke
      const currentText = editorRef.current.textContent || '';
      const newText = data.replace(/<[^>]*>/g, '') || '';
      
      // Only update if there's a significant difference or if editor is empty
      if (Math.abs(currentText.length - newText.length) > 5 || !currentText || !editorRef.current.innerHTML.trim()) {
        // Sanitize external data before updating editor
        editorRef.current.innerHTML = sanitizeHTML(data);
        setContent(data);
      }
    } else if (!isUpdatingFromProps.current && editorRef.current && !data && content) {
      // Clear content if data is empty
      editorRef.current.innerHTML = '';
      setContent('');
    }
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Only update if content actually changed
      if (newContent !== content) {
        setContent(newContent);
        
        // Debounce the onChange callback to prevent too frequent updates
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          if (onChange) {
            onChange(newContent);
          }
        }, 300);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowToolbar(true);
  };

  const handleBlur = (event: React.FocusEvent) => {
    // Don't hide toolbar if focus is moving to toolbar buttons
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('[role="toolbar"]')) {
      return;
    }
    
    setIsFocused(false);
    // Delay hiding toolbar to allow clicking on it
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setShowToolbar(false), 300);
  };

  const handleSelection = () => {
    try {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
        // Only show toolbar if there's actually selected text
        setShowToolbar(true);
      }
    } catch (error) {
      console.warn('Selection handling failed:', error);
    }
  };

  const execCommand = (command: string, value?: string) => {
    try {
      // Store current selection
      const selection = window.getSelection();
      let range = null;
      
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
      
      // Execute the command
      const success = document.execCommand(command, false, value);
      
      if (success) {
        // Restore focus to editor
        if (editorRef.current) {
          editorRef.current.focus();
          
          // For list commands, ensure proper formatting
          if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
            // Force the list to be properly formatted
            const lists = editorRef.current.querySelectorAll('ul, ol');
            lists.forEach(list => {
              if (list.children.length === 0) {
                const li = document.createElement('li');
                li.innerHTML = '&nbsp;';
                list.appendChild(li);
              }
            });
          }
          
          // Only restore selection for formatting commands, not for typing
          if (range && selection && (command.includes('format') || command.includes('insert'))) {
            try {
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (e) {
              // If range restoration fails, just place cursor at end
              const newRange = document.createRange();
              newRange.selectNodeContents(editorRef.current);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
        
        // Update content after DOM changes
        setTimeout(() => {
          if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            if (newContent !== content) {
              setContent(newContent);
              if (onChange) {
                onChange(newContent);
              }
            }
          }
        }, 10);
      }
    } catch (error) {
      console.warn('Command execution failed:', error);
    }
  };

  const insertHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
    setAnchorEl(null);
  };

  const insertQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const insertCode = () => {
    execCommand('formatBlock', 'pre');
  };

  const insertList = (ordered: boolean) => {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
    execCommand(command);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertText = (text: string) => {
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        handleContentChange();
      }
    } catch (error) {
      console.warn('Text insertion failed:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: isFocused ? '#007AFF' : 'divider',
        borderRadius: 2,
        minHeight: 400,
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: isFocused ? '#007AFF' : 'text.secondary',
        },
      }}
    >
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <Paper
          elevation={2}
          role="toolbar"
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            borderRadius: 1,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            mb: 1,
          }}
        >
          {/* Text Formatting */}
          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={() => execCommand('bold')}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={() => execCommand('italic')}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={() => execCommand('underline')}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <FormatUnderlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Headings */}
          <Tooltip title="Heading">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <Title fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { minWidth: 120 }
            }}
          >
            <MenuItem onClick={() => insertHeading(1)}>
              <ListItemText primary="Heading 1" />
            </MenuItem>
            <MenuItem onClick={() => insertHeading(2)}>
              <ListItemText primary="Heading 2" />
            </MenuItem>
            <MenuItem onClick={() => insertHeading(3)}>
              <ListItemText primary="Heading 3" />
            </MenuItem>
            <MenuItem onClick={() => insertHeading(4)}>
              <ListItemText primary="Heading 4" />
            </MenuItem>
          </Menu>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Lists */}
          <Tooltip title="Bullet List">
            <IconButton
              size="small"
              onClick={() => insertList(false)}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onClick={() => insertList(true)}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Special Blocks */}
          <Tooltip title="Quote">
            <IconButton
              size="small"
              onClick={insertQuote}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <FormatQuote fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Code Block">
            <IconButton
              size="small"
              onClick={insertCode}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <Code fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Links and Images */}
          <Tooltip title="Insert Link">
            <IconButton
              size="small"
              onClick={insertLink}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <Link fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Insert Image">
            <IconButton
              size="small"
              onClick={insertImage}
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
            >
              <Image fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      )}

      {/* Editor Content */}
      <Box
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={(e) => {
          // Use a more gentle approach that doesn't interfere with cursor
          const target = e.target as HTMLDivElement;
          const newContent = target.innerHTML;
          if (newContent !== content) {
            isUpdatingFromProps.current = true;
            setContent(newContent);
            
            // Debounce the onChange callback
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
              if (onChange) {
                onChange(newContent);
              }
              isUpdatingFromProps.current = false;
            }, 300);
          }
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseUp={handleSelection}
        onKeyUp={(e) => {
          // Only handle selection on specific keys, not every keystroke
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            handleSelection();
          }
        }}
        onKeyDown={(e) => {
          // Handle special keys without interfering with normal typing
          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            execCommand('insertBr');
          } else if (e.key === 'Tab') {
            e.preventDefault();
            // Insert tab as spaces
            insertText('    ');
          }
          // Don't prevent default for normal typing keys
        }}
        sx={{
          minHeight: 350,
          p: 3,
          outline: 'none',
          fontSize: '1rem',
          lineHeight: 1.6,
          color: 'text.primary',
          fontFamily: '"Georgia", "Times New Roman", serif',
          '&:empty:before': {
            content: `"${placeholder}"`,
            color: 'text.secondary',
            fontStyle: 'italic',
            pointerEvents: 'none',
          },
          '& h1': {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '1rem',
            marginTop: '2rem',
            color: 'text.primary',
          },
          '& h2': {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: '0.8rem',
            marginTop: '1.5rem',
            color: 'text.primary',
          },
          '& h3': {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: '0.6rem',
            marginTop: '1.2rem',
            color: 'text.primary',
          },
          '& h4': {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: '0.5rem',
            marginTop: '1rem',
            color: 'text.primary',
          },
          '& p': {
            marginBottom: '1rem',
            lineHeight: 1.6,
            fontSize: '1rem',
          },
          '& blockquote': {
            borderLeft: '4px solid #007AFF',
            paddingLeft: '1rem',
            margin: '1.5rem 0',
            fontStyle: 'italic',
            color: 'text.secondary',
            fontSize: '1.1rem',
            lineHeight: 1.5,
          },
                  '& ul, & ol': {
                    marginBottom: '1rem',
                    paddingLeft: '2rem',
                    listStyleType: 'disc',
                    '& li': {
                      marginBottom: '0.5rem',
                      lineHeight: 1.6,
                      display: 'list-item',
                      listStylePosition: 'outside',
                    },
                  },
                  '& ul': {
                    listStyleType: 'disc',
                  },
                  '& ol': {
                    listStyleType: 'decimal',
                  },
          '& pre': {
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
            fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: '0.9rem',
            lineHeight: 1.4,
            overflow: 'auto',
            border: '1px solid #e0e0e0',
          },
          '& code': {
            backgroundColor: '#f5f5f5',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px',
            fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: '0.9em',
            border: '1px solid #e0e0e0',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            margin: '1rem 0',
            display: 'block',
          },
          '& a': {
            color: '#007AFF',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& strong, & b': {
            fontWeight: 700,
          },
          '& em, & i': {
            fontStyle: 'italic',
          },
          '& u': {
            textDecoration: 'underline',
          },
        }}
      />
    </Box>
  );
};

export default EditorComponent;
