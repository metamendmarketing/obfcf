import React from "react";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ProcessStepsBlockData {
  steps: ProcessStep[];
  theme?: 'light' | 'dark';
  variant?: 'list' | 'grid';
}

export function ProcessStepsBlock({ data, isPrint = false }: { data: ProcessStepsBlockData; isPrint?: boolean }) {
  const steps = data.steps || [];
  
  const variant = data.variant || 'list';
  const containerClass = variant === 'grid' ? 'concept-2-styles w-full' : 'concept-3-styles w-full';

  return (
    <div className="w-full relative mb-8 mt-6 px-16">
      <div className={containerClass}>
        <ol>
          {steps.map((step, idx) => (
            <li key={idx}>
              <p>{step.title}</p>
              <div dangerouslySetInnerHTML={{ __html: step.description }} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
