import React from "react";
import { Block } from "@/lib/store";
import { HeroHeaderBlock, HeroHeaderData } from "./HeroHeaderBlock";
import { TextBlock, TextBlockData } from "./TextBlock";
import { HighlightCardsBlock, HighlightCardsBlockData } from "./HighlightCardsBlock";
import { CoverBlock } from "./CoverBlock";
import { DataPanelBlock } from "./DataPanelBlock";
import { ProcessStepsBlock, ProcessStepsBlockData } from "./ProcessStepsBlock";
import { ServiceListBlock, ServiceListBlockData } from "./ServiceListBlock";
import { StageHeaderBlock, StageHeaderData } from "./StageHeaderBlock";
import { StageCaptionBlock, StageCaptionData } from "./StageCaptionBlock";
import { ThankYouBlock } from "./ThankYouBlock";

export const BlockRenderer = React.memo(function BlockRenderer({ blocks, audit, isPrint = false }: { blocks: Block[], audit?: any, isPrint?: boolean }) {
  return (
    <div className="w-full">
      {blocks.map((block) => {
        switch (block.type) {
          case 'HeroHeader':
            return <HeroHeaderBlock key={block.id} data={block.data as HeroHeaderData} isPrint={isPrint} />;
          case 'RichText':
            return <TextBlock key={block.id} data={block.data as TextBlockData} />;
          case 'HighlightCards':
            return <HighlightCardsBlock key={block.id} data={block.data as HighlightCardsBlockData} />;
          case 'Cover':
            return <CoverBlock key={block.id} audit={audit} />;
          case 'DataPanel':
            return <DataPanelBlock key={block.id} audit={audit} />;
          case 'ProcessSteps':
            return <ProcessStepsBlock key={block.id} data={block.data as ProcessStepsBlockData} isPrint={isPrint} />;
          case 'ServiceList':
            return <ServiceListBlock key={block.id} data={block.data as ServiceListBlockData} isPrint={isPrint} />;
          case 'StageHeader':
            return <StageHeaderBlock key={block.id} data={block.data as StageHeaderData} />;
          case 'StageCaption':
            return <StageCaptionBlock key={block.id} data={block.data as StageCaptionData} />;
          case 'ThankYou':
            return <ThankYouBlock key={block.id} data={block.data} />;
          default:
            return <div key={block.id} className="p-4 bg-red-100 text-red-800">Unknown block type: {block.type}</div>;
        }
      })}
    </div>
  );
});
