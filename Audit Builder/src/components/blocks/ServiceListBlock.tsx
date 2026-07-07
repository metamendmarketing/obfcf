import React from "react";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServiceListBlockData {
  services: ServiceItem[];
  columns?: 2 | 3;
}

export function ServiceListBlock({ data, isPrint = false }: { data: ServiceListBlockData; isPrint?: boolean }) {
  const services = data.services || [];
  return (
    <div className="px-8 md:px-16 mt-2 pb-8 relative z-10">
      <div className="monthly-list-styles font-sans w-full">
        <ol>
          {services.map((service, idx) => (
            <li key={idx}>
              <p><strong>{service.title}</strong></p>
              <div dangerouslySetInnerHTML={{ __html: service.description }} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
