import { Mail, Phone, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { useLang } from '../hooks/use-lang';

export default function ContactPage() {
  const { lang } = useLang();
  const isRTL = lang === 'ar';
  const t = lang === 'ar'
    ? { title: 'تواصل معنا', subtitle: 'نحن هنا للمساعدة. تواصل معنا عبر أي وسيلة.', email: 'البريد الإلكتروني', phone: 'الهاتف', location: 'الموقع', loc: 'الرياض، المملكة العربية السعودية', back: 'العودة للرئيسية' }
    : { title: 'Contact Us', subtitle: 'We are here to help. Reach us through any channel.', email: 'Email', phone: 'Phone', location: 'Location', loc: 'Riyadh, Saudi Arabia', back: 'Back to Home' };

  const contacts = [
    { icon: Mail, label: t.email, value: 'support@emaraa.sa', href: 'mailto:support@emaraa.sa', external: false },
    { icon: Phone, label: t.phone, value: '+966 54 321 0000', href: 'tel:+966543210000', external: false },
    { icon: MapPin, label: t.location, value: t.loc, href: 'https://maps.google.com/?q=Riyadh,Saudi+Arabia', external: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}{t.back}
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>
        <div className="space-y-4">
          {contacts.map(({ icon: Icon, label, value, href, external }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{value}</a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}