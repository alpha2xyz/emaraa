import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export default function AdminLoginPage() {
  const { language, direction } = useLanguage();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const t = {
    title: language === 'ar' ? 'دخول المسؤول' : 'Admin Login',
    subtitle: language === 'ar' ? 'الوصول مخصص للمسؤولين فقط' : 'Access restricted to administrators only',
    username: language === 'ar' ? 'اسم المستخدم' : 'Username',
    login: language === 'ar' ? 'تسجيل الدخول' : 'Login',
    backToHome: language === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    invalidCredentials: language === 'ar' ? 'اسم المستخدم غير صحيح' : 'Invalid username',
    loggingIn: language === 'ar' ? 'جاري التسجيل...' : 'Logging in...',
  };

  const adminLoginMutation = useMutation({
    mutationFn: async (data: { username: string }) => {
      const res = await apiRequest("POST", "/api/admin/login", data);
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: language === 'ar' ? 'مرحباً!' : 'Welcome!', description: language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully' });
      setLocation('/dashboard');
    },
    onError: () => {
      setError(t.invalidCredentials);
    },
  });

  const form = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = async (data: z.infer<typeof adminLoginSchema>) => {
    setError(null);
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir={direction}>
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-white">{t.title}</CardTitle>
          <CardDescription className="text-slate-400">{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">{t.username}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Alpha1004" 
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        data-testid="input-admin-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={adminLoginMutation.isPending}
                data-testid="button-admin-login"
              >
                {adminLoginMutation.isPending ? t.loggingIn : t.login}
              </Button>

              <Link href="/">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-slate-400 hover:text-white"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToHome}
                </Button>
              </Link>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
