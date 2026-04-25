import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';

export async function openSignedPdf(bucket: string, pathOrUrl: string) {
  if (pathOrUrl.startsWith('http')) {
    window.open(pathOrUrl, '_blank');
    return;
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(pathOrUrl, 3600);
  if (error || !data?.signedUrl) {
    toast({ title: 'تعذّر فتح الملف', description: 'Could not open file. Please try again.', variant: 'destructive' });
    return;
  }
  window.open(data.signedUrl, '_blank');
}
