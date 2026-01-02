import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Building2,
  Settings,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("overview");

  const content = {
    ar: {
      title: "لوحة تحكم الإدارة",
      overview: "نظرة عامة",
      users: "المستخدمين",
      requests: "الطلبات",
      properties: "العقارات",
      settings: "الإعدادات",
      totalUsers: "إجمالي المستخدمين",
      totalRequests: "إجمالي الطلبات",
      totalProperties: "إجمالي العقارات",
      pendingRequests: "الطلبات المعلقة",
      recentActivity: "النشاط الأخير",
      viewAll: "عرض الكل",
    },
    en: {
      title: "Admin Dashboard",
      overview: "Overview",
      users: "Users",
      requests: "Requests",
      properties: "Properties",
      settings: "Settings",
      totalUsers: "Total Users",
      totalRequests: "Total Requests",
      totalProperties: "Total Properties",
      pendingRequests: "Pending Requests",
      recentActivity: "Recent Activity",
      viewAll: "View All",
    },
  };

  const t = content[lang];

  // بيانات وهمية - ستستبدل بـ API حقيقي
  const stats = {
    users: 156,
    requests: 89,
    properties: 234,
    pending: 12,
  };

  return (
    <div className={`container mx-auto p-6 ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="users">{t.users}</TabsTrigger>
          <TabsTrigger value="requests">{t.requests}</TabsTrigger>
          <TabsTrigger value="properties">{t.properties}</TabsTrigger>
          <TabsTrigger value="settings">{t.settings}</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.totalUsers}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3" /> +12%{" "}
                  {lang === "ar" ? "من الشهر الماضي" : "from last month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.totalRequests}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.requests}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3" /> +8%{" "}
                  {lang === "ar" ? "من الشهر الماضي" : "from last month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.totalProperties}
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.properties}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3" /> +5%{" "}
                  {lang === "ar" ? "من الشهر الماضي" : "from last month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.pendingRequests}
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "تحتاج إلى مراجعة" : "Need review"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* النشاط الأخير */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentActivity}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminActivityList lang={lang} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* إدارة المستخدمين */}
        <TabsContent value="users">
          <AdminUsersTable lang={lang} />
        </TabsContent>

        {/* إدارة الطلبات */}
        <TabsContent value="requests">
          <AdminRequestsTable lang={lang} />
        </TabsContent>

        {/* إدارة العقارات */}
        <TabsContent value="properties">
          <AdminPropertiesTable lang={lang} />
        </TabsContent>

        {/* الإعدادات */}
        <TabsContent value="settings">
          <AdminSettings lang={lang} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// مكون قائمة النشاط
function AdminActivityList({ lang }: { lang: string }) {
  const activities = [
    {
      id: 1,
      user: lang === "ar" ? "أحمد محمد" : "Ahmed Mohammed",
      action: lang === "ar" ? "أضاف عقار جديد" : "Added new property",
      time: lang === "ar" ? "منذ 5 دقائق" : "5 minutes ago",
    },
    {
      id: 2,
      user: lang === "ar" ? "سارة علي" : "Sara Ali",
      action: lang === "ar" ? "أنشأت طلب خدمة" : "Created service request",
      time: lang === "ar" ? "منذ 15 دقيقة" : "15 minutes ago",
    },
    {
      id: 3,
      user: lang === "ar" ? "محمد خالد" : "Mohammed Khaled",
      action: lang === "ar" ? "قدم عرض سعر" : "Submitted a bid",
      time: lang === "ar" ? "منذ 30 دقيقة" : "30 minutes ago",
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between border-b pb-3"
        >
          <div>
            <p className="font-medium">{activity.user}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
      ))}
    </div>
  );
}

// مكون جدول المستخدمين
function AdminUsersTable({ lang }: { lang: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lang === "ar" ? "إدارة المستخدمين" : "Manage Users"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "سيتم عرض قائمة المستخدمين هنا"
            : "Users list will be displayed here"}
        </p>
      </CardContent>
    </Card>
  );
}

// مكون جدول الطلبات
function AdminRequestsTable({ lang }: { lang: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lang === "ar" ? "إدارة الطلبات" : "Manage Requests"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "سيتم عرض قائمة الطلبات هنا"
            : "Requests list will be displayed here"}
        </p>
      </CardContent>
    </Card>
  );
}

// مكون جدول العقارات
function AdminPropertiesTable({ lang }: { lang: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lang === "ar" ? "إدارة العقارات" : "Manage Properties"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "سيتم عرض قائمة العقارات هنا"
            : "Properties list will be displayed here"}
        </p>
      </CardContent>
    </Card>
  );
}

// مكون الإعدادات
function AdminSettings({ lang }: { lang: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lang === "ar" ? "إعدادات النظام" : "System Settings"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "سيتم عرض الإعدادات هنا"
            : "Settings will be displayed here"}
        </p>
      </CardContent>
    </Card>
  );
}
