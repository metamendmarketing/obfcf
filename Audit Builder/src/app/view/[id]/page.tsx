import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { SharedPresentationViewer } from "@/components/audit/SharedPresentationViewer";
import { Metadata } from "next";

export const revalidate = 0; // Ensure it's never cached statically so we always fetch the latest share link if updated

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data } = await supabase.from('app_state').select('state').eq('id', `shared-${resolvedParams.id}`).single();
  
  if (!data || !data.state) {
    return { title: 'Audit Not Found' };
  }

  return {
    title: `${data.state.companyName || 'Client'} - Audit Presentation`,
    description: 'A shared audit presentation.',
  };
}

export default async function SharedViewPage({ params }: Props) {
  const resolvedParams = await params;
  const shareId = resolvedParams.id;
  
  const { data, error } = await supabase.from('app_state').select('state').eq('id', `shared-${shareId}`).single();

  if (error || !data || !data.state) {
    console.error("Shared audit fetch error:", error);
    notFound();
  }

  const audit = data.state;

  return (
    <SharedPresentationViewer audit={audit} />
  );
}
