import re

with open('src/app/audits/[id]/edit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for Sortable components
import_statement = '''import { LivePreview } from "@/components/audit/LivePreview";
import { SortableFindingsList, SortablePagesList } from "@/components/audit/SidebarSortables";'''
content = content.replace('import { LivePreview } from "@/components/audit/LivePreview";', import_statement)


# 2. Replace the modular pages rendering block
modular_regex = r'\{isModularExpanded && audit\.pages\.filter\(p => !p\.isHidden\)\.map\(page => \{.*?\n              \}\)\}'
modular_replacement = '''{isModularExpanded && (
                <SortablePagesList 
                  audit={audit} 
                  activeSection={activeSection} 
                  onSelectPage={(id) => {
                    if (id === "toc_pseudo_id") {
                      handleSidebarClick("toc", null);
                    } else {
                      handleSidebarClick("page:" + id, null);
                    }
                  }} 
                />
              )}'''

content = re.sub(modular_regex, modular_replacement, content, flags=re.DOTALL)


# 3. Replace the findings rendering block
findings_regex = r'\{isFindingsExpanded && findings\.map\(finding => \(.*?\n          \}\)\}'
findings_replacement = '''{isFindingsExpanded && (
            <SortableFindingsList 
              auditId={audit.id} 
              activeFindingId={activeFindingId} 
              onSelectFinding={(id) => handleSidebarClick("findings", id)} 
            />
          )}'''

content = re.sub(findings_regex, findings_replacement, content, flags=re.DOTALL)


with open('src/app/audits/[id]/edit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
