import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';

export async function openSignedPdf(bucket: string, storagePath: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) {
    toast({ title: 'تعذّر فتح الملف', description: 'Could not open file. Please try again.', variant: 'destructive' });
    return;
  }
  window.open(data.signedUrl, '_blank');
}
