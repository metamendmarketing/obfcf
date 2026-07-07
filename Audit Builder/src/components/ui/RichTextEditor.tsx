import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageResize from 'tiptap-extension-resize-image';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import Dropcursor from '@tiptap/extension-dropcursor';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered, ImageIcon, AlignLeft, AlignRight, AlignCenter, Maximize, Indent, Outdent, Quote, Table as TableIcon, Trash2, Rows, Columns, Combine, Split, Palette, Minus } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Indent as IndentExtension } from '@/lib/tiptap-indent';
import { compressImage } from '@/lib/utils';
import { Extension } from '@tiptap/core';

export const Color = Extension.create({
  name: 'color',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: element => {
              if (element.classList.contains('text-primary-blue')) return '#356af9';
              if (element.classList.contains('text-secondary-purple')) return '#a774fd';
              if (element.classList.contains('text-pure-white')) return '#ffffff';
              if (element.classList.contains('text-deep-black')) return '#0A0A0A';
              if (element.classList.contains('text-dark-navy')) return '#111326';
              return element.style.color?.replace(/['"]+/g, '');
            },
            renderHTML: attributes => {
              if (!attributes.color) return {};
              
              const colorMap: Record<string, string> = {
                '#356af9': 'text-primary-blue',
                '#a774fd': 'text-secondary-purple',
                '#ffffff': 'text-pure-white',
                '#0a0a0a': 'text-deep-black',
                '#111326': 'text-dark-navy',
              };
              
              const hex = attributes.color.toLowerCase();
              if (colorMap[hex]) {
                return { class: colorMap[hex], style: `color: ${attributes.color}` };
              }
              return { style: `color: ${attributes.color}` };
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setColor: color => ({ chain }) => chain().setMark('textStyle', { color }).run(),
      unsetColor: () => ({ chain }) => chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run(),
    }
  },
});

const METAMEND_COLORS = [
  { name: 'Primary Blue', hex: '#356af9' },
  { name: 'Secondary Purple', hex: '#a774fd' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Deep Black', hex: '#0A0A0A' },
  { name: 'Dark Navy', hex: '#111326' },
  { name: 'Default', hex: '' },
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  theme?: 'light' | 'dark';
  onPolish?: (wordLimit: number) => void;
  isPolishing?: boolean;
}
const CustomImage = ImageResize.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: 'rounded-md shadow-lg border border-black/10',
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
      style: {
        default: null,
      }
    };
  },
  renderHTML({ HTMLAttributes }) {
    // We intercept the proprietary containerStyle and wrapperStyle attributes 
    // that the extension uses for its inline WordPress-style controls,
    // and seamlessly merge them into the standard HTML 'style' attribute.
    const { containerStyle, wrapperStyle, ...rest } = HTMLAttributes;
    
    let inlineStyle = rest.style || '';
    
    if (containerStyle) {
      inlineStyle = `${inlineStyle}; ${containerStyle}`;
    }
    if (wrapperStyle) {
       // Filter out width: 100% from wrapperStyle so it doesn't stretch the <img> in Live Preview
       let safeWrapperStyle = wrapperStyle.replace(/width:\s*100%;?/g, '');
       inlineStyle = `${inlineStyle}; ${safeWrapperStyle}`;
    }
    
    // Transform block margins into floats for Live Preview
    let isLeft = inlineStyle.includes('margin: 0px auto 0px 0px') || inlineStyle.includes('margin: 0 auto 0 0');
    let isRight = inlineStyle.includes('margin: 0px 0px 0px auto') || inlineStyle.includes('margin: 0 0 0 auto');
    // For center, ensure we don't accidentally match the 4-part margins
    let isCenter = !isLeft && !isRight && (inlineStyle.includes('margin: 0px auto') || inlineStyle.includes('margin: 0 auto'));

    // Remove any flex/margins that conflict
    inlineStyle = inlineStyle.replace(/display:\s*flex;?/g, '');
    inlineStyle = inlineStyle.replace(/margin:\s*0;?/g, '');
    inlineStyle = inlineStyle.replace(/margin:\s*0(?:px)?\s+auto\s+0(?:px)?\s+0(?:px)?;?/g, '');
    inlineStyle = inlineStyle.replace(/margin:\s*0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+auto;?/g, '');
    inlineStyle = inlineStyle.replace(/margin:\s*0(?:px)?\s+auto;?/g, '');

    if (isLeft) {
      inlineStyle += ' float: left !important; margin-right: 2.5rem !important; margin-bottom: 1.5rem !important; display: inline-block !important;';
    } else if (isRight) {
      inlineStyle += ' float: right !important; margin-left: 2.5rem !important; margin-bottom: 1.5rem !important; display: inline-block !important;';
    } else if (isCenter) {
      inlineStyle += ' display: block !important; margin: 2.5rem auto !important; float: none !important;';
    }
    
    // Clean up any double semicolons
    inlineStyle = inlineStyle.replace(/;+/g, ';').trim();
    
    // Tiptap's Image parent uses mergeAttributes, but we bypass it to directly inject our clean style.
    // IMPORTANT: We MUST also include containerstyle and wrapperstyle in the HTML output.
    // Otherwise, when Tiptap parses the HTML back into the editor on reload, it loses the wrapperStyle 
    // and the editor visual state breaks (e.g. floats in preview but not in editor).
    return ['img', { 
      ...rest, 
      style: inlineStyle,
      ...(containerStyle && { containerstyle: containerStyle }),
      ...(wrapperStyle && { wrapperstyle: wrapperStyle })
    }];
  }
});


export function RichTextEditor({ value, onChange, placeholder, minHeight = "100px", theme = 'dark', onPolish, isPolishing }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-400 underline decoration-indigo-400/50 hover:decoration-indigo-400',
        },
      }),
      TextStyle,
      FontSize,
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      GlobalDragHandle.configure({
        dragHandleWidth: 20,
        scrollTreshold: 100,
      }),
      Dropcursor.configure({
        color: '#0057FF',
        width: 3,
        class: 'dropcursor-indicator',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      IndentExtension,
      Color,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-a:no-underline ${theme === 'dark' ? 'prose-invert text-white/90' : 'prose-gray text-gray-900'} prose-sm max-w-none focus:outline-none w-full p-4 min-h-[${minHeight}]`,
      },
      handleDOMEvents: {
        paste: (view, event) => {
          const items = event.clipboardData?.items;
          if (items) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') === 0) {
                const file = items[i].getAsFile();
                if (file) {
                  event.preventDefault();
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    try {
                      const formData = new FormData();
                      formData.append('file', file, file.name || 'pasted-image.png');
                      
                      const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                      });
                      
                      const { url } = await uploadRes.json();
                      if (url) {
                        const { schema } = view.state;
                        const node = schema.nodes.image.create({ src: url });
                        const transaction = view.state.tr.replaceSelectionWith(node);
                        view.dispatch(transaction);
                      }
                    } catch (e) {
                      console.error("Failed to upload pasted image:", e);
                    }
                  };
                  reader.readAsDataURL(file);
                  return true;
                }
              }
            }
          }
          return false;
        },
        drop: (view, event) => {
          const files = event.dataTransfer?.files;
          if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              if (files[i].type.indexOf('image') === 0) {
                event.preventDefault();
                const reader = new FileReader();
                reader.onloadend = async () => {
                  try {
                    const formData = new FormData();
                    formData.append('file', files[i], files[i].name || 'dropped-image.png');
                    
                    const uploadRes = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData
                    });
                    
                    const { url } = await uploadRes.json();
                    if (url) {
                      const { schema } = view.state;
                      const node = schema.nodes.image.create({ src: url });
                      const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                      let transaction;
                      if (coordinates) {
                        transaction = view.state.tr.insert(coordinates.pos, node);
                      } else {
                        transaction = view.state.tr.replaceSelectionWith(node);
                      }
                      view.dispatch(transaction);
                    }
                  } catch (e) {
                    console.error("Failed to upload dropped image:", e);
                  }
                };
                reader.readAsDataURL(files[i]);
                return true;
              }
            }
          }
          return false;
        }
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
  const [isColorPromptOpen, setIsColorPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [customWordLimit, setCustomWordLimit] = useState("100");

  // Keep editor synced with external value changes (like when AI returns polished result)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (isLinkPromptOpen && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [isLinkPromptOpen]);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkPromptOpen(true);
  };

  const applyLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setIsLinkPromptOpen(false);
    setLinkUrl('');
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const formData = new FormData();
            formData.append('file', file, file.name || 'inserted-image.png');
            
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            const { url } = await uploadRes.json();
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          } catch (e) {
            console.error("Failed to upload inserted image:", e);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const wordCount = editor.getText().trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div 
      className={`flex flex-col border rounded-md transition-all relative overflow-hidden resize-y min-h-[200px] max-h-[800px] ${theme === 'dark' ? 'border-white/10 bg-white/5 focus-within:ring-1 focus-within:ring-indigo-500' : 'border-gray-200 bg-white shadow-sm focus-within:border-[#0057FF] focus-within:ring-1 focus-within:ring-[#0057FF]'}`}
      style={{ height: '400px' }}
    >
      
      <div className={`flex items-center gap-1 p-2 border-b flex-wrap sticky top-0 z-50 ${theme === 'dark' ? 'border-white/10 bg-[#1A1A1A]/95 backdrop-blur-md' : 'border-gray-200 bg-white/95 backdrop-blur-md shadow-sm'}`}>
        <select
          value={editor.getAttributes('textStyle').fontSize || ''}
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontSize(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          className={`rounded p-1 text-sm focus:outline-none focus:ring-1 mr-2 ${theme === 'dark' ? 'bg-black/40 border border-white/10 text-white/90 focus:ring-indigo-500' : 'bg-white border border-gray-200 text-gray-800 focus:ring-[#0057FF]'}`}
        >
          <option value="">Text Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="30px">30px</option>
          <option value="36px">36px</option>
          <option value="48px">48px</option>
        </select>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setIsColorPromptOpen(!isColorPromptOpen); setIsLinkPromptOpen(false); }}
            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'}`}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {isColorPromptOpen && (
            <div className={`absolute top-full left-0 mt-1 p-2 rounded shadow-xl border z-50 flex flex-col gap-1 w-40 ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/20' : 'bg-white border-gray-200'}`}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Brand Palette</div>
              <div className="grid grid-cols-6 gap-1">
                {METAMEND_COLORS.filter(c => c.hex !== '').map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => {
                      (editor.chain().focus() as any).setColor(color.hex).run();
                      setIsColorPromptOpen(false);
                    }}
                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="mt-1 pt-1 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    (editor.chain().focus() as any).unsetColor().run();
                    setIsColorPromptOpen(false);
                  }}
                  className={`w-full text-xs py-1 rounded text-center transition-colors ${theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Clear Color
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>

        <div className="relative">
          <button
            type="button"
            onClick={toggleLink}
            className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? (theme === 'dark' ? 'bg-white/20 text-indigo-400' : 'bg-blue-100 text-[#0057FF]') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          
          {isLinkPromptOpen && (
            <div className={`absolute top-full left-0 mt-1 p-2 rounded shadow-xl border z-50 flex items-center gap-2 ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/20' : 'bg-white border-gray-200'}`}>
              <input 
                ref={linkInputRef}
                type="url" 
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className={`text-xs p-1.5 rounded w-48 focus:outline-none ${theme === 'dark' ? 'bg-black/50 text-white border border-white/10 focus:border-indigo-500' : 'bg-gray-50 text-black border border-gray-200 focus:border-[#0057FF]'}`}
                onKeyDown={e => {
                  if (e.key === 'Enter') applyLink();
                  if (e.key === 'Escape') setIsLinkPromptOpen(false);
                }}
              />
              <button 
                type="button"
                onClick={applyLink}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-[#0057FF] text-white hover:bg-[#0047cc]'}`}
              >
                Apply
              </button>
            </div>
          )}
        </div>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (editor.can().sinkListItem('listItem')) {
              editor.chain().focus().sinkListItem('listItem').run();
            } else {
              editor.chain().focus().indent().run();
            }
          }}
          className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Indent"
        >
          <Indent className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (editor.can().liftListItem('listItem')) {
              editor.chain().focus().liftListItem('listItem').run();
            } else {
              editor.chain().focus().outdent().run();
            }
          }}
          className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-200'}`}
          title="Outdent"
        >
          <Outdent className="w-4 h-4" />
        </button>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('blockquote') ? (theme === 'dark' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700') : (theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200')}`}
          title="Insert Callout"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
        <button
          type="button"
          onClick={addImage}
          className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {onPolish && (
          <div className="relative group ml-auto flex items-center">
            <button 
              type="button"
              disabled={isPolishing}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${isPolishing ? 'bg-indigo-500/10 text-indigo-400 cursor-not-allowed' : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'}`}
            >
              {isPolishing ? "✨ Polishing..." : "✨ Polish with Gemini"}
            </button>
            <div className="absolute top-full right-0 pt-2 hidden group-hover:flex flex-col z-50 min-w-[200px]">
              <div className="flex flex-col bg-[#1a1a1a] border border-white/10 rounded shadow-xl overflow-hidden p-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Target Word Count</label>
                  <input 
                    type="number" 
                    value={customWordLimit}
                    onChange={(e) => setCustomWordLimit(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => onPolish(parseInt(customWordLimit) || 0)} 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded transition-colors"
                >
                  Start Polish
                </button>
                <p className="text-[9px] text-white/30 text-center leading-tight">Leave blank or 0 for no limit</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {editor && (
        <BubbleMenu 
          editor={editor} 
          shouldShow={({ editor }) => editor.isActive('table')}
          className={`flex items-center gap-1 p-1.5 rounded-lg shadow-xl border ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md`}
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-amber-400 hover:bg-white/10' : 'text-amber-600 hover:bg-gray-100'}`}
            title="Add Column"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-white/10' : 'text-red-600 hover:bg-gray-100'}`}
            title="Delete Column"
          >
            <div className="flex items-center -space-x-1">
               <Columns className="w-4 h-4" />
               <Minus className="w-3 h-3" />
            </div>
          </button>
          <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-amber-400 hover:bg-white/10' : 'text-amber-600 hover:bg-gray-100'}`}
            title="Add Row"
          >
            <Rows className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-white/10' : 'text-red-600 hover:bg-gray-100'}`}
            title="Delete Row"
          >
            <div className="flex items-center -space-x-1">
               <Rows className="w-4 h-4" />
               <Minus className="w-3 h-3" />
            </div>
          </button>
          <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
          <button
            type="button"
            onClick={() => {
              if (editor.can().mergeCells()) {
                editor.chain().focus().mergeCells().run();
              } else {
                alert("To merge cells, you must select multiple cells first. Tip: Click inside one cell, then hold Shift and click inside another cell to select them.");
              }
            }}
            className={`p-1.5 rounded transition-colors ${!editor.can().mergeCells() ? 'opacity-50' : ''} ${theme === 'dark' ? 'text-amber-400 hover:bg-white/10' : 'text-amber-600 hover:bg-gray-100'}`}
            title="Merge Cells"
          >
            <Combine className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (editor.can().splitCell()) {
                editor.chain().focus().splitCell().run();
              } else {
                alert("To split a cell, you must first click inside a previously merged cell.");
              }
            }}
            className={`p-1.5 rounded transition-colors ${!editor.can().splitCell() ? 'opacity-50' : ''} ${theme === 'dark' ? 'text-amber-400 hover:bg-white/10' : 'text-amber-600 hover:bg-gray-100'}`}
            title="Split Cell"
          >
            <Split className="w-4 h-4" />
          </button>
          <div className={`w-[1px] h-4 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-white/10' : 'text-red-600 hover:bg-gray-100'}`}
            title="Delete Table"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      <div className="flex-1 cursor-text overflow-y-auto pb-6" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      <div className={`absolute bottom-2 right-3 text-[10px] font-semibold tracking-wider pointer-events-none select-none z-10 ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>
        {wordCount} words
      </div>
    </div>
  );
}
