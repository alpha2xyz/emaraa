
import type React from 'react'
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useLocation, useRoute } from "wouter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Building2, Save, Loader2, ArrowLeft, AlertCircle, ClipboardList } from "lucide-react"
import { useLang } from "@/hooks/use-lang"
import { supabase } from "../lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function RequestForm() {
  const { lang } = useLang()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [, params] = useRoute("/dashboard/owner/requests/:id/edit")
  const requestId = params?.id
  const [formData, setFormData] = useState({
    property_id: "",
    description: "",
  })
  const [commercialFields, setCommercialFields] = useState({
    buildingType: "",
    floorsCount: "",
    specialNeeds: "",
  })
  const [showValidation, setShowValidation] = useState(false)

  const content = {
    ar: {
      title: "طلب خدمة جديد",
      subtitle: "اختر العقار وراجع نطاق الخدمات المطلوبة",
      selectProperty: "اختر العقار",
      propertyPlaceholder: "اختر العقار",
      scopeTitle: "نطاق الخدمات المطلوبة",
      scopeShort: "نظافة يومية للمناطق المشتركة والأسطح والخزانات ونقل النفايات، صيانة دورية للإنارة والمضخات والمصاعد والكاميرات، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية. متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، مع السجل التجاري والاعتمادات والمراجع أو البورتفوليو، لمدة سنة قابلة للتجديد.",
      commercialScopeShort: "نظافة شاملة للمداخل والردهات والأدوار والمواقف والمرافق العامة، صيانة أنظمة التكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، إدارة النفايات، طوارئ 24/7، تسديد فواتير المرافق. متطلبات العرض: تفصيل السعر لكل طابق أو وحدة تجارية، الإجمالي شامل الضريبة، السجل التجاري، شهادات اعتماد، ومراجع لمشاريع تجارية مماثلة. لمدة سنة قابلة للتجديد.",
      commercialDetailsTitle: "تفاصيل المبنى التجاري",
      buildingTypeLabel: "نوع المبنى التجاري",
      buildingTypePlaceholder: "مثال: مكتبي، تجاري، مستودع، مختلط",
      floorsLabel: "عدد الأدوار المطلوب تغطيتها",
      floorsPlaceholder: "مثال: 5 أدوار",
      specialNeedsLabel: "متطلبات خاصة",
      specialNeedsPlaceholder: "مواقف سيارات، مطابخ تجارية، مولدات، غرف خوادم...",
      description: "تفاصيل إضافية",
      descriptionPlaceholder: "اكتب أي تفاصيل أو ملاحظات إضافية...",
      submit: "إرسال الطلب",
      submitting: "جاري الإرسال...",
      cancel: "إلغاء",
      success: "تم إرسال الطلب بنجاح!",
      updateSuccess: "تم التحديث بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      noProperties: "لا توجد عقارات! أضف عقاراً أولاً",
      addProperty: "إضافة عقار",
      propertyRequired: "يرجى اختيار العقار",
      limitReached: "لقد وصلت للحد الأقصى (طلب واحد فقط لكل حساب)",
    },
    en: {
      title: "New Service Request",
      subtitle: "Select property and review the required scope of services",
      selectProperty: "Select Property",
      propertyPlaceholder: "Select property",
      scopeTitle: "Scope of Services Required",
      scopeShort: "Daily cleaning of common areas, rooftops, tanks, and waste removal; periodic maintenance of lighting, pumps, elevators, and cameras; pest control and landscaping as needed; 24/7 emergency support; utility bill payments; with clarification of working arrangements during holidays and national occasions. Proposal Requirements: Full service breakdown with per-unit and total contract pricing inclusive of VAT, payment terms, commercial registration, accreditations, and client references or portfolio, for a one-year renewable contract.",
      commercialScopeShort: "Full cleaning of entrances, lobbies, floors, parking, and common areas; maintenance of central HVAC systems, elevators, escalators, cameras, and fire suppression systems; waste management; 24/7 emergencies; utility bill payments. Proposal Requirements: Per-floor or per-commercial-unit pricing, total including VAT, commercial registration, accreditations, and references for similar commercial projects. One-year renewable contract.",
      commercialDetailsTitle: "Commercial Building Details",
      buildingTypeLabel: "Commercial Building Type",
      buildingTypePlaceholder: "e.g. Office, Retail, Warehouse, Mixed",
      floorsLabel: "Number of Floors to Cover",
      floorsPlaceholder: "e.g. 5 floors",
      specialNeedsLabel: "Special Requirements",
      specialNeedsPlaceholder: "Parking, commercial kitchens, generators, server rooms...",
      description: "Additional Details",
      descriptionPlaceholder: "Write any additional details or notes...",
      submit: "Submit Request",
      submitting: "Submitting...",
      cancel: "Cancel",
      success: "Request submitted successfully!",
      updateSuccess: "Updated successfully!",
      error: "An error occurred, please try again",
      noProperties: "No properties! Add a property first",
      addProperty: "Add Property",
      propertyRequired: "Please select a property",
      limitReached: "You have reached the limit (1 request per account)",
    },
  }

  const t = content[lang]

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone")
      if (!phone) throw new Error("Not logged in")
      const { data: user } = await supabase.from("users").select("id").eq("phone", phone).single()
      if (!user) throw new Error("User not found")
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { data: existingRequest } = useQuery({
    queryKey: ["request", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase.from("requests").select("*").eq("id", requestId).single()
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (existingRequest) {
      setFormData({
        property_id: existingRequest.property_id || "",
        description: existingRequest.description || "",
      })
    }
  }, [existingRequest])

  const selectedProperty = properties?.find((p: any) => p.id === formData.property_id)
  const isCommercial = selectedProperty?.building_type === 'commercial'

  const isPropertyValid = formData.property_id !== ""
  const isFormValid = isPropertyValid

  const mutation = useMutation({
    mutationFn: async () => {
      const phone = localStorage.getItem("userPhone")
      if (!phone) throw new Error("Not logged in")
      const { data: user } = await supabase.from("users").select("id").eq("phone", phone).single()
      if (!user) throw new Error("User not found")

      if (!requestId) {
        const { count } = await supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id);
        if ((count ?? 0) >= 1) throw new Error("limit_reached");
      }

      let finalDescription = formData.description
      if (isCommercial && !requestId) {
        const parts = []
        if (commercialFields.buildingType) parts.push(`${t.buildingTypeLabel}: ${commercialFields.buildingType}`)
        if (commercialFields.floorsCount) parts.push(`${t.floorsLabel}: ${commercialFields.floorsCount}`)
        if (commercialFields.specialNeeds) parts.push(`${t.specialNeedsLabel}: ${commercialFields.specialNeeds}`)
        if (parts.length) {
          finalDescription = parts.join('\n') + (formData.description ? '\n\n' + formData.description : '')
        }
      }

      const payload = {
        owner_id: user.id,
        property_id: formData.property_id,
        service_category: "standard",
        description: finalDescription || null,
        status: "pending",
      }

      const { error } = requestId
        ? await supabase.from("requests").update(payload).eq("id", requestId)
        : await supabase.from("requests").insert(payload)

      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: requestId ? t.updateSuccess : t.success,
        variant: "default",
      })
      setLocation("/dashboard/owner/requests")
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error("Error:", error)
      toast({
        title: error?.message === "limit_reached" ? t.limitReached : t.error,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowValidation(true)
    if (!isFormValid) return
    mutation.mutate()
  }

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard/owner/requests")} className="mb-4">
            <ArrowLeft className="w-4 h-4 me-2" />
            {t.cancel}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            {t.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار العقار */}
          <Card className={showValidation && !isPropertyValid ? "border-red-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t.selectProperty}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
              >
                <SelectTrigger className={showValidation && !isPropertyValid ? "border-red-500" : ""}>
                  <SelectValue placeholder={t.propertyPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property: any) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showValidation && !isPropertyValid && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {t.propertyRequired}
                </p>
              )}
            </CardContent>
          </Card>

          {/* نطاق الخدمات المطلوبة */}
          <Card className={isCommercial ? "border-amber-200 bg-amber-50/30" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className={`w-5 h-5 ${isCommercial ? "text-amber-600" : ""}`} />
                {t.scopeTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {isCommercial ? t.commercialScopeShort : t.scopeShort}
              </p>
            </CardContent>
          </Card>

          {/* تفاصيل المبنى التجاري */}
          {isCommercial && !requestId && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Building2 className="w-5 h-5" />
                  {t.commercialDetailsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">{t.buildingTypeLabel}</p>
                  <Input
                    placeholder={t.buildingTypePlaceholder}
                    value={commercialFields.buildingType}
                    onChange={(e) => setCommercialFields({ ...commercialFields, buildingType: e.target.value })}
                    className="text-base"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t.floorsLabel}</p>
                  <Input
                    placeholder={t.floorsPlaceholder}
                    value={commercialFields.floorsCount}
                    onChange={(e) => setCommercialFields({ ...commercialFields, floorsCount: e.target.value })}
                    className="text-base"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{t.specialNeedsLabel}</p>
                  <Textarea
                    placeholder={t.specialNeedsPlaceholder}
                    value={commercialFields.specialNeeds}
                    onChange={(e) => setCommercialFields({ ...commercialFields, specialNeeds: e.target.value })}
                    rows={3}
                    className="text-base resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* التفاصيل */}
          <Card>
            <CardHeader>
              <CardTitle>{t.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                rows={4}
                maxLength={500}
                className="text-base resize-none"
              />
              <p className="text-xs text-gray-500 text-end mt-1">
                {formData.description.length} / 500
              </p>
            </CardContent>
          </Card>

          {/* أزرار */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 me-2" />
                  {t.submit}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/dashboard/owner/requests")}>
              {t.cancel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
