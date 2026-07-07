const fs = require('fs');

let css = `@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --font-mono: var(--font-mono);
  
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --popover: #ffffff;
  --popover-foreground: #171717;
  --primary: #262626;
  --primary-foreground: #fafafa;
  --secondary: #f5f5f5;
  --secondary-foreground: #262626;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #262626;
  --destructive: #ef4444;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #a3a3a3;
  --radius: 0.35rem;
}

.dark {
  /* Very dark navy/black background */
  --background: #050505;
  --foreground: #fafafa;
  
  /* Cards are slightly lighter for contrast, often with a hint of purple/navy */
  --card: #0c0d1c;
  --card-foreground: #fafafa;
  
  --popover: #0c0d1c;
  --popover-foreground: #fafafa;
  
  /* Vibrant indigo/purple for primary actions */
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  
  --secondary: #1e1b4b;
  --secondary-foreground: #fafafa;
  
  --muted: #1e1e24;
  --muted-foreground: #a1a1aa;
  
  --accent: #1e1b4b;
  --accent-foreground: #fafafa;
  
  --destructive: #ef4444;
  
  --border: rgba(255, 255, 255, 0.1);
  --input: rgba(255, 255, 255, 0.05);
  --ring: #6366f1;
  --radius: 0.35rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
`;

const fileStr = fs.readFileSync('src/app/globals.css', 'utf8');
const lines = fileStr.split('\\n');
// Find where "@layer base {" starts in the CURRENT broken file.
let startIdx = 0;
for(let i=0; i<lines.length; i++){
  if(lines[i].includes('@layer base {')){
    startIdx = i;
    break;
  }
}

// We know the rest of the file is fine after @layer base {
const restOfFile = lines.slice(startIdx + 6).join('\\n');
fs.writeFileSync('src/app/globals.css', css + '\\n' + restOfFile);
console.log('Fixed globals.css');
