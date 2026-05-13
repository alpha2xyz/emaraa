import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, FileText, CheckCircle2, XCircle, Building2, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLang } from '../hooks/use-lang';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';
import { StatusBadge } from '@/components/StatusBadge';
import { openSignedPdf } from '../lib/storage';

export default function OwnerOffersPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ id: string }>('/dashboard/owner/requests/:id/offers');
  const requestId = params?.id;
  const queryClient = useQueryClient();
  const isRTL = lang === 'ar';
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  const t = lang === 'ar'
    ? {
        title: 'العروض المقدمة',
        back: 'رجوع',
        notes: 'الملاحظات',
        viewOffer: 'عرض الملف',
        accept: 'قبول',
        reject: 'رفض',
        noOffers: 'لم يتم تقديم أي عروض بعد',
        acceptSuccess: 'تم قبول العرض بنجاح',
        rejectSuccess: 'تم رفض العرض',
        error: 'حدث خطأ',
        confirmTitle: 'تأكيد القبول',
        confirmMsg: 'قبول هذا العرض يظهر لك رقم مزود الخدمة للتواصل معه وسيؤدي تلقائياً إلى رفض جميع العروض الأخرى. هل أنت متأكد؟',
        confirmBtn: 'نعم، قبول',
        cancelBtn: 'إلغاء',
        phone: 'رقم التواصل',
      }
    : {
        title: 'Submitted Offers',
        back: 'Back',
        notes: 'Notes',
        viewOffer: 'View Offer',
        accept: 'Accept',
        reject: 'Reject',
        noOffers: 'No offers submitted yet',
        acceptSuccess: 'Offer accepted successfully',
        rejectSuccess: 'Offer rejected',
        error: 'An error occurred',
        confirmTitle: 'Confirm Accept',
        confirmMsg: "Accepting this offer will reveal the provider's phone number for direct contact and will automatically reject all other offers. Are you sure?",
        confirmBtn: 'Yes, Accept',
        cancelBtn: 'Cancel',
        phone: 'Contact Number',
      };

  // Issue 4: fetch request + property for context subtitle
  const { data: requestContext } = useQuery({
    queryKey: ['owner', 'request-context', requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('id, properties(name, city)')
        .eq('id', requestId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['owner', 'offers', requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_offers')
        // Issue 5A: include users(phone) via providers join
        .select('id, offer_file_url, notes, status, created_at, providers(id, company_name, city, users(phone))')
        .eq('request_id', requestId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: 'accepted' | 'rejected' }) => {
      const phone = localStorage.getItem('userPhone');
      if (!phone) throw new Error('Unauthorized');
      const { data: user } = await supabase.from('users').select('id').eq('phone', phone).single();
      if (!user) throw new Error('Unauthorized');
      const { data: req } = await supabase
        .from('requests')
        .select('owner_id')
        .eq('id', requestId!)
        .single();
      if (!req || req.owner_id !== user.id) throw new Error('Unauthorized');

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

  const property = (requestContext?.properties as any);

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/owner/requests')} className="mb-4">
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}{t.back}
        </Button>

        {/* Issue 4: property name + city subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#2E4A6B]" />{t.title}
          </h1>
          {property && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {property.name} · {property.city}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
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
                      <Building2 className="w-5 h-5 text-[#2E4A6B]" />
                      {offer.providers?.company_name}
                    </CardTitle>
                    <StatusBadge status={offer.status} lang={lang} />
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

                  {/* Issue 5A: show provider phone on accepted card */}
                  {offer.status === 'accepted' && offer.providers?.users?.phone && (
                    <div className="flex items-center gap-2 bg-[#F3F5F1] border border-[#C0CCB8] rounded-lg px-3 py-2">
                      <Phone className="w-4 h-4 text-[#6B7C5E] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#576649] font-medium">{t.phone}</p>
                        <a
                          href={`tel:${offer.providers.users.phone}`}
                          className="text-sm font-bold text-[#576649] hover:underline"
                        >
                          {offer.providers.users.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    {offer.offer_file_url && (
                      <Button variant="outline" size="sm" onClick={() => openSignedPdf('provider-offers', offer.offer_file_url)}>
                        <FileText className="w-4 h-4 me-2" />{t.viewOffer}
                      </Button>
                    )}
                    {offer.status === 'pending' && (
                      <>
                        {/* Issue 5A: accept opens dialog instead of direct mutation */}
                        <Button
                          size="sm"
                          className="bg-[#6B7C5E] hover:bg-[#576649]"
                          disabled={statusMutation.isPending}
                          onClick={() => setAcceptingOfferId(offer.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 me-2" />{t.accept}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ offerId: offer.id, status: 'rejected' })}
                        >
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

      {/* Issue 5A: confirmation dialog */}
      <AlertDialog open={!!acceptingOfferId} onOpenChange={(open) => { if (!open) setAcceptingOfferId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAcceptingOfferId(null)}>{t.cancelBtn}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (acceptingOfferId) {
                  statusMutation.mutate({ offerId: acceptingOfferId, status: 'accepted' });
                  setAcceptingOfferId(null);
                }
              }}
            >
              {t.confirmBtn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
