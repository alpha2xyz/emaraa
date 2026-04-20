import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, FileText, CheckCircle2, XCircle, Building2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLang } from '../hooks/use-lang';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';

export default function OwnerOffersPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ id: string }>('/dashboard/owner/requests/:id/offers');
  const requestId = params?.id;
  const queryClient = useQueryClient();
  const isRTL = lang === 'ar';

  const t = lang === 'ar'
    ? { title: 'العروض المقدمة', back: 'رجوع', company: 'الشركة', city: 'المدينة', notes: 'الملاحظات', viewOffer: 'عرض الملف', accept: 'قبول', reject: 'رفض', noOffers: 'لم يتم تقديم أي عروض بعد', loading: 'جارٍ التحميل…', accepted: 'مقبول', pending: 'معلق', rejected: 'مرفوض', acceptSuccess: 'تم قبول العرض بنجاح', rejectSuccess: 'تم رفض العرض', error: 'حدث خطأ' }
    : { title: 'Submitted Offers', back: 'Back', company: 'Company', city: 'City', notes: 'Notes', viewOffer: 'View Offer', accept: 'Accept', reject: 'Reject', noOffers: 'No offers submitted yet', loading: 'Loading…', accepted: 'Accepted', pending: 'Pending', rejected: 'Rejected', acceptSuccess: 'Offer accepted successfully', rejectSuccess: 'Offer rejected', error: 'An error occurred' };

  const { data: offers, isLoading } = useQuery({
    queryKey: ['owner', 'offers', requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_offers')
        .select('id, offer_file_url, notes, status, created_at, providers(id, company_name, city)')
        .eq('request_id', requestId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: 'accepted' | 'rejected' }) => {
      const { error } = await supabase.from('provider_offers').update({ status }).eq('id', offerId);
      if (error) throw error;
      if (status === 'accepted') {
        await supabase.from('requests').update({ status: 'in_progress' }).eq('id', requestId!);
        await supabase.from('provider_offers').update({ status: 'rejected' }).eq('request_id', requestId!).neq('id', offerId);
      }
    },
    onSuccess: (_, { status }) => {
      toast({ title: status === 'accepted' ? t.acceptSuccess : t.rejectSuccess });
      queryClient.invalidateQueries({ queryKey: ['owner', 'offers', requestId] });
      queryClient.invalidateQueries({ queryKey: ['api', 'requests'] });
    },
    onError: () => toast({ title: t.error, variant: 'destructive' }),
  });

  const statusBadge = (s: string) => {
    if (s === 'accepted') return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 me-1" />{t.accepted}</Badge>;
    if (s === 'rejected') return <Badge variant="destructive"><XCircle className="h-3 w-3 me-1" />{t.rejected}</Badge>;
    return <Badge variant="secondary"><Clock className="h-3 w-3 me-1" />{t.pending}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/owner/requests')} className="mb-4">
          <ArrowLeft className="w-4 h-4 me-2" />{t.back}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />{t.title}
        </h1>

        {isLoading ? (
          <p className="text-center text-gray-500 py-12">{t.loading}</p>
        ) : !offers?.length ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t.noOffers}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offers.map((offer: any) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      {offer.providers?.company_name}
                    </CardTitle>
                    {statusBadge(offer.status)}
                  </div>
                  <p className="text-sm text-gray-500">{offer.providers?.city}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {offer.notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t.notes}</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{offer.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3 flex-wrap">
                    {offer.offer_file_url && (
                      <a href={offer.offer_file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 me-2" />{t.viewOffer}
                        </Button>
                      </a>
                    )}
                    {offer.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ offerId: offer.id, status: 'accepted' })}>
                          <CheckCircle2 className="w-4 h-4 me-2" />{t.accept}
                        </Button>
                        <Button size="sm" variant="destructive" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ offerId: offer.id, status: 'rejected' })}>
                          <XCircle className="w-4 h-4 me-2" />{t.reject}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}