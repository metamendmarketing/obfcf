import re

with open('src/components/editor/BlockEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add expandedSubItems state
state_code = '''  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [expandedSubItems, setExpandedSubItems] = useState<Set<string>>(new Set());

  const toggleSubItem = (id: string) => {
    const next = new Set(expandedSubItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSubItems(next);
  };'''
content = content.replace('  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());', state_code)

# 2. Update HighlightCards
cards_regex = r'(<span className=\"text-sm font-bold text-white/60\">Card \{cardIndex \+ 1\}</span>)\s*(<button)'
cards_replacement = '''\\1
                    <div className=\"flex gap-2 items-center\">
                      <button 
                        onClick={() => toggleSubItem(`${block.id}-card-${cardIndex}`)}
                        className=\"text-white/50 hover:text-white transition-colors mr-2\"
                      >
                        {expandedSubItems.has(`${block.id}-card-${cardIndex}`) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      \\2'''
content = re.sub(cards_regex, cards_replacement, content)

cards_content_regex = r'(<input \s*type=\"text\" \s*placeholder=\"Large Number \(Optional e\.g\. \'01\'\)\".*?className=\"w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white min-h-\[80px\]\"\s*/>)'
cards_content_replacement = '''{expandedSubItems.has(`${block.id}-card-${cardIndex}`) && (
                    <>
                      \\1
                    </>
                  )}'''
content = re.sub(cards_content_regex, cards_content_replacement, content, flags=re.DOTALL)

# 3. Update ProcessSteps
steps_regex = r'(<span className=\"text-sm font-bold text-white/60\">Step \{stepIndex \+ 1\}</span>)\s*(<button)'
steps_replacement = '''\\1
                    <div className=\"flex gap-2 items-center\">
                      <button 
                        onClick={() => toggleSubItem(`${block.id}-step-${stepIndex}`)}
                        className=\"text-white/50 hover:text-white transition-colors mr-2\"
                      >
                        {expandedSubItems.has(`${block.id}-step-${stepIndex}`) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      \\2'''
content = re.sub(steps_regex, steps_replacement, content)

steps_content_regex = r'(<input \s*type=\"text\" \s*placeholder=\"Step Title\".*?minHeight=\"120px\" \s*/>\s*</div>)'
steps_content_replacement = '''{expandedSubItems.has(`${block.id}-step-${stepIndex}`) && (
                    <>
                      \\1
                    </>
                  )}'''
content = re.sub(steps_content_regex, steps_content_replacement, content, flags=re.DOTALL)

# 4. Update ServiceList
services_regex = r'(<span className=\"text-sm font-bold text-white/60\">Service \{serviceIndex \+ 1\}</span>)\s*(<button)'
services_replacement = '''\\1
                    <div className=\"flex gap-2 items-center\">
                      <button 
                        onClick={() => toggleSubItem(`${block.id}-service-${serviceIndex}`)}
                        className=\"text-white/50 hover:text-white transition-colors mr-2\"
                      >
                        {expandedSubItems.has(`${block.id}-service-${serviceIndex}`) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      \\2'''
content = re.sub(services_regex, services_replacement, content)

services_content_regex = r'(<input \s*type=\"text\" \s*placeholder=\"Service Title\".*?minHeight=\"120px\" \s*/>\s*</div>)'
services_content_replacement = '''{expandedSubItems.has(`${block.id}-service-${serviceIndex}`) && (
                    <>
                      \\1
                    </>
                  )}'''
content = re.sub(services_content_regex, services_content_replacement, content, flags=re.DOTALL)

# Fix closing divs
content = content.replace('Remove Card\n                    </button>', 'Remove Card\n                    </button>\n                  </div>')
content = content.replace('Remove Step\n                    </button>', 'Remove Step\n                    </button>\n                  </div>')
content = content.replace('Remove Service\n                    </button>', 'Remove Service\n                    </button>\n                  </div>')

# Expand new sub items automatically
content = content.replace('''updateBlock(block.id, { ...block.data, cards: [...(block.data.cards || []), { title: 'New Card', text: '' }] })}''', '''{
                  const newIndex = (block.data.cards || []).length;
                  toggleSubItem(`${block.id}-card-${newIndex}`);
                  updateBlock(block.id, { ...block.data, cards: [...(block.data.cards || []), { title: 'New Card', text: '' }] });
                }}''')

content = content.replace('''updateBlock(block.id, { ...block.data, steps: [...(block.data.steps || []), { title: 'New Step', description: '<p></p>' }] })}''', '''{
                  const newIndex = (block.data.steps || []).length;
                  toggleSubItem(`${block.id}-step-${newIndex}`);
                  updateBlock(block.id, { ...block.data, steps: [...(block.data.steps || []), { title: 'New Step', description: '<p></p>' }] });
                }}''')

content = content.replace('''updateBlock(block.id, { ...block.data, services: [...(block.data.services || []), { title: 'New Service', description: '<p></p>' }] })}''', '''{
                  const newIndex = (block.data.services || []).length;
                  toggleSubItem(`${block.id}-service-${newIndex}`);
                  updateBlock(block.id, { ...block.data, services: [...(block.data.services || []), { title: 'New Service', description: '<p></p>' }] });
                }}''')

with open('src/components/editor/BlockEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
