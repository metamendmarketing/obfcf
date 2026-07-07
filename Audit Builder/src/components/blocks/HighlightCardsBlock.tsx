import React from "react";

export interface HighlightCardData {
  number?: string;
  title: string;
  text: string;
}

export interface HighlightCardsBlockData {
  cards: HighlightCardData[];
}

export function HighlightCardsBlock({ data }: { data: HighlightCardsBlockData }) {
  return (
    <div className="px-16 mt-12 pb-16 z-20 w-full flex justify-center break-inside-avoid">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl">
        {data.cards.map((card, idx) => (
          <div key={idx} className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
            {card.number && (
              <div className="text-4xl font-black text-[#0057FF]/20 font-serif">{card.number}</div>
            )}
            <h3 className="text-xl font-bold text-black">{card.title}</h3>
            <p className="text-gray-600 leading-relaxed text-[0.95rem]">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
