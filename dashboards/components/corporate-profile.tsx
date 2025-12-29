"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, Loader2, User, Building2, Mail, Phone, Image as ImageIcon, FileText, AlertCircle } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { getCorporateMerchant, updateCorporateMerchant, CorporateMerchant } from "@/lib/api-client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function CorporateProfile() {
  const { user } = useAuth()
  const colors = DASHBOARD_COLORS("corporate")
  const [merchant, setMerchant] = useState<CorporateMerchant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    businessRegistrationNumber: "",
    contactEmail: "",
    contactPhone: "",
    logoPath: "",
    category: "",
    bannerUrl: "",
    termsAndConditions: "",
  })

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    const fetchMerchant = async () => {
      if (!user?.merchant?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const merchantData = await getCorporateMerchant(user.merchant.id)
        setMerchant(merchantData)
        setFormData({
          businessName: merchantData.businessName || "",
          businessRegistrationNumber: merchantData.businessRegistrationNumber || "",
          contactEmail: merchantData.contactEmail || "",
          contactPhone: merchantData.contactPhone || "",
          logoPath: merchantData.logoPath || "",
          category: merchantData.category || "",
          bannerUrl: merchantData.bannerUrl || "",
          termsAndConditions: merchantData.termsAndConditions || "",
        })
      } catch (error: any) {
        console.error("Failed to fetch merchant:", error)
        toast.error(error.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchant()
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required"
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address"
    }

    if (formData.logoPath && !isValidUrl(formData.logoPath)) {
      newErrors.logoPath = "Please enter a valid URL"
    }

    if (formData.bannerUrl && !isValidUrl(formData.bannerUrl)) {
      newErrors.bannerUrl = "Please enter a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user?.merchant?.id) {
      return
    }

    setIsSaving(true)
    try {
      // Prepare update data - only include fields that have changed
      const updateData: any = {}
      
      if (formData.businessName !== merchant?.businessName) {
        updateData.businessName = formData.businessName
      }
      if (formData.businessRegistrationNumber !== (merchant?.businessRegistrationNumber || "")) {
        updateData.businessRegistrationNumber = formData.businessRegistrationNumber || null
      }
      if (formData.contactEmail !== merchant?.contactEmail) {
        updateData.contactEmail = formData.contactEmail
      }
      if (formData.contactPhone !== (merchant?.contactPhone || "")) {
        updateData.contactPhone = formData.contactPhone || null
      }
      if (formData.logoPath !== (merchant?.logoPath || "")) {
        updateData.logoPath = formData.logoPath || null
      }
      if (formData.category !== (merchant?.category || "")) {
        updateData.category = formData.category || null
      }
      if (formData.bannerUrl !== (merchant?.bannerUrl || "")) {
        updateData.bannerUrl = formData.bannerUrl || null
      }
      if (formData.termsAndConditions !== (merchant?.termsAndConditions || "")) {
        updateData.termsAndConditions = formData.termsAndConditions || null
      }

      // Only send request if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save")
        setIsSaving(false)
        return
      }

      const updatedMerchant = await updateCorporateMerchant(user.merchant.id, updateData)
      setMerchant(updatedMerchant)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      console.error("Failed to update merchant:", error)
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user?.merchant?.id) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Unable to load merchant profile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your business information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="font-semibold">Business Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter business name"
                    className={errors.businessName ? "border-destructive" : ""}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive">{errors.businessName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessRegistrationNumber">
                    Registration Number
                  </Label>
                  <Input
                    id="businessRegistrationNumber"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) => handleInputChange("businessRegistrationNumber", e.target.value)}
                    placeholder="Enter registration number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., Food & Beverage, Retail, etc."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="font-semibold">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="contact@business.com"
                    className={errors.contactEmail ? "border-destructive" : ""}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive">{errors.contactEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>
            </div>

            {/* Media & Branding Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ImageIcon className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="font-semibold">Media & Branding</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoPath">Logo URL</Label>
                  <Input
                    id="logoPath"
                    type="url"
                    value={formData.logoPath}
                    onChange={(e) => handleInputChange("logoPath", e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className={errors.logoPath ? "border-destructive" : ""}
                  />
                  {errors.logoPath && (
                    <p className="text-sm text-destructive">{errors.logoPath}</p>
                  )}
                  {formData.logoPath && isValidUrl(formData.logoPath) && (
                    <div className="mt-2">
                      <img
                        src={formData.logoPath}
                        alt="Logo preview"
                        className="h-20 w-20 object-contain border rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => handleInputChange("bannerUrl", e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className={errors.bannerUrl ? "border-destructive" : ""}
                  />
                  {errors.bannerUrl && (
                    <p className="text-sm text-destructive">{errors.bannerUrl}</p>
                  )}
                  {formData.bannerUrl && isValidUrl(formData.bannerUrl) && (
                    <div className="mt-2">
                      <img
                        src={formData.bannerUrl}
                        alt="Banner preview"
                        className="h-32 w-full object-cover border rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="w-4 h-4" style={{ color: colors.primary }} />
                <h3 className="font-semibold">Terms & Conditions</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                  placeholder="Enter terms and conditions text here..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Status Information (Read-only) */}
            {merchant && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 pb-2">
                  <AlertCircle className="w-4 h-4" style={{ color: colors.primary }} />
                  <h3 className="font-semibold">Account Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Verification Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          merchant.verificationStatus === "approved"
                            ? "default"
                            : merchant.verificationStatus === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {merchant.verificationStatus || "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Status</Label>
                    <div className="mt-1">
                      <Badge variant={merchant.isActive ? "default" : "secondary"}>
                        {merchant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {merchant.verifiedAt && (
                  <p className="text-sm text-muted-foreground">
                    Verified on: {new Date(merchant.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

