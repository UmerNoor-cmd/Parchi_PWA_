"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, RefreshCw, Building2, Store, Upload, Loader2 } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { SupabaseStorageService } from "@/lib/storage"
import { corporateSignup, branchSignup, type ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useMerchants } from "@/hooks/use-merchants"

interface AccountCreationProps {
  role?: 'admin' | 'corporate'
  corporateId?: string
  emailPrefix?: string | null
}

export function AccountCreation({ role = 'admin', corporateId, emailPrefix }: AccountCreationProps) {
  const colors = DASHBOARD_COLORS(role === 'corporate' ? 'corporate' : 'admin')
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [corporateData, setCorporateData] = useState({
    name: "",
    emailPrefix: "",
    contactEmail: "",
    password: "",
    contact: "",
    regNumber: "",
    category: "",
    logo: null as File | null,
    logoUrl: ""
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isLogoUploading, setIsLogoUploading] = useState(false)
  const [isBranchUploading, setIsBranchUploading] = useState(false)

  const [branchData, setBranchData] = useState({
    name: "",
    emailPrefix: "",
    password: "",
    address: "",
    city: "",
    contact: "",
    linkedCorporate: role === 'corporate' && corporateId ? corporateId : "",
    latitude: "",
    longitude: ""
  })

  // Fetch real corporate accounts from API
  const { merchants: corporateAccounts, loading: merchantsLoading, error: merchantsError } = useMerchants()

  // Helper to generate slug from business name
  const generateSlug = (businessName: string) => {
    const slug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return slug ? `${slug}-` : ""
  }

  // Sync corporateId with form state when it becomes available
  useEffect(() => {
    if (role === 'corporate' && corporateId) {
      // If we have access to corporate details (e.g. passed in props or fetched), we could auto-fill here.
      // However, 'corporateId' is just an ID. If 'corporateAccounts' has it, we can use it.
      const corporate = corporateAccounts.find(c => c.id === corporateId)
      const initialSlug = corporate ? generateSlug(corporate.businessName) : ""

      setBranchData(prev => ({
        ...prev,
        linkedCorporate: corporateId,
        emailPrefix: prev.emailPrefix || initialSlug // Only set if empty
      }))
    }
  }, [role, corporateId, corporateAccounts])

  if (merchantsError && role === 'admin') {
    console.error("Failed to fetch merchants:", merchantsError)
  }



  const generatePassword = (type: 'corporate' | 'branch') => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    if (type === 'corporate') {
      setCorporateData(prev => ({ ...prev, password }))
    } else {
      setBranchData(prev => ({ ...prev, password }))
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLogoUploading(true)
    try {
      const businessName = corporateData.name || "temp-upload"
      const url = await SupabaseStorageService.uploadCorporateLogo(file, businessName)

      setCorporateData(prev => ({
        ...prev,
        logo: file,
        logoUrl: url
      }))
    } catch (error) {
      console.error("Error uploading logo:", error)
    } finally {
      setIsLogoUploading(false)
    }
  }

  const handleCorporateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      if (!corporateData.name || !corporateData.emailPrefix || !corporateData.contactEmail ||
        !corporateData.password || !corporateData.contact) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        })
        setIsUploading(false)
        return
      }

      if (!corporateData.logoUrl) {
        toast({
          variant: "destructive",
          title: "Logo Required",
          description: "Please upload a business logo before creating the account.",
        })
        setIsUploading(false)
        return
      }

      const email = `${corporateData.emailPrefix}@parchipakistan.com`

      const requestData = {
        name: corporateData.name,
        emailPrefix: corporateData.emailPrefix,
        contactEmail: corporateData.contactEmail,
        password: corporateData.password,
        contact: corporateData.contact,
        email: email,
        logo_path: corporateData.logoUrl,
        ...(corporateData.regNumber && { regNumber: corporateData.regNumber }),
        ...(corporateData.category && { category: corporateData.category }),
      }

      const response = await corporateSignup(requestData)

      toast({
        title: "Account Created Successfully",
        description: response.message || "Corporate account created. Verification pending.",
      })

      setCorporateData({
        name: "",
        emailPrefix: "",
        contactEmail: "",
        password: "",
        contact: "",
        regNumber: "",
        category: "",
        logo: null,
        logoUrl: ""
      })

    } catch (error) {
      console.error("Error creating corporate account:", error)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as ApiError
        const errorMessage = Array.isArray(apiError.message)
          ? apiError.message.join(', ')
          : apiError.message || 'Failed to create corporate account'

        toast({
          variant: "destructive",
          title: `Error ${apiError.statusCode}`,
          description: errorMessage,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create corporate account. Please try again.",
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBranchUploading(true)

    try {
      if (!branchData.name || !branchData.emailPrefix || !branchData.password ||
        !branchData.address || !branchData.city || !branchData.contact) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        })
        setIsBranchUploading(false)
        return
      }

      if (!branchData.linkedCorporate) {
        toast({
          variant: "destructive",
          title: "Corporate Account Required",
          description: role === 'admin' ? "Please select a corporate account." : "Corporate ID missing.",
        })
        setIsBranchUploading(false)
        return
      }

      const email = `${branchData.emailPrefix}@parchipakistan.com`

      const requestData = {
        name: branchData.name,
        emailPrefix: branchData.emailPrefix,
        password: branchData.password,
        address: branchData.address,
        city: branchData.city,
        contact: branchData.contact,
        linkedCorporate: branchData.linkedCorporate,
        email: email,
        ...(branchData.latitude && { latitude: branchData.latitude }),
        ...(branchData.longitude && { longitude: branchData.longitude }),
      }

      const response = await branchSignup(requestData)

      toast({
        title: "Branch Account Created Successfully",
        description: response.message || "Branch account created. Verification pending.",
      })

      setBranchData({
        name: "",
        emailPrefix: "",
        password: "",
        address: "",
        city: "",
        contact: "",
        linkedCorporate: role === 'corporate' && corporateId ? corporateId : "",
        latitude: "",
        longitude: ""
      })

    } catch (error) {
      console.error("Error creating branch account:", error)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as ApiError
        const errorMessage = Array.isArray(apiError.message)
          ? apiError.message.join(', ')
          : apiError.message || 'Failed to create branch account'

        toast({
          variant: "destructive",
          title: `Error ${apiError.statusCode}`,
          description: errorMessage,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create branch account. Please try again.",
        })
      }
    } finally {
      setIsBranchUploading(false)
    }
  }

  // FIXED: Changed from a component to a regular render function
  const renderBranchForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>New Branch Account</CardTitle>
        <CardDescription>Create a branch account linked to a corporate entity.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBranchSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {role === 'admin' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="branch-corporate">Linked Corporate Account</Label>
                <Select
                  value={branchData.linkedCorporate}
                  onValueChange={(value) => {
                    const corporate = corporateAccounts.find(c => c.id === value)
                    const slug = corporate ? generateSlug(corporate.businessName) : ""
                    setBranchData(prev => ({
                      ...prev,
                      linkedCorporate: value,
                      emailPrefix: slug
                    }))
                  }}
                  disabled={merchantsLoading || corporateAccounts.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      merchantsLoading
                        ? "Loading corporations..."
                        : merchantsError
                          ? "Error loading corporations"
                          : corporateAccounts.length === 0
                            ? "No corporations available"
                            : "Select a corporate entity"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {corporateAccounts.map(corp => (
                      <SelectItem key={corp.id} value={corp.id}>{corp.businessName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                placeholder="e.g. Downtown Branch"
                value={branchData.name}
                onChange={(e) => setBranchData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-email">Email Address</Label>
              <div className="flex items-center">
                <Input
                  id="branch-email"
                  placeholder="yellow-taxi-pizza-downtown" // Example showing full format
                  className="rounded-r-none border-r-0"
                  value={branchData.emailPrefix}
                  onChange={(e) => setBranchData(prev => ({ ...prev, emailPrefix: e.target.value }))}
                  required
                />
                <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground whitespace-nowrap">
                  @parchipakistan.com
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-password">Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="branch-password"
                    type={showPassword ? "text" : "password"}
                    value={branchData.password}
                    onChange={(e) => setBranchData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generatePassword('branch')}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-contact">Contact Phone</Label>
              <Input
                id="branch-contact"
                placeholder="03001234567"
                value={branchData.contact}
                onChange={(e) => setBranchData(prev => ({ ...prev, contact: e.target.value.replace(/\D/g, '') }))}
                maxLength={11}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-city">City</Label>
              <Input
                id="branch-city"
                placeholder="e.g. Karachi"
                value={branchData.city}
                onChange={(e) => setBranchData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="branch-address">Address</Label>
              <Input
                id="branch-address"
                placeholder="Complete branch address"
                value={branchData.address}
                onChange={(e) => setBranchData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-lat">Latitude (Optional)</Label>
              <Input
                id="branch-lat"
                placeholder="e.g. 24.8607"
                value={branchData.latitude}
                onChange={(e) => setBranchData(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-long">Longitude (Optional)</Label>
              <Input
                id="branch-long"
                placeholder="e.g. 67.0011"
                value={branchData.longitude}
                onChange={(e) => setBranchData(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto"
              style={{ backgroundColor: colors.primary }}
              disabled={isBranchUploading}
            >
              {isBranchUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Branch...
                </>
              ) : (
                "Create Branch Account"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  if (role === 'corporate') {
    return (
      <div className="w-full mx-auto">
        {renderBranchForm()}
      </div>
    )
  }

  return (
    <div className="w-full mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Account Creation</h2>
        <p className="text-muted-foreground mt-1">Create new corporate and branch accounts</p>
      </div>

      <Tabs defaultValue="corporate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="corporate" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Corporate Account
          </TabsTrigger>
          <TabsTrigger value="branch" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Branch Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="corporate">
          <Card>
            <CardHeader>
              <CardTitle>New Corporate Account</CardTitle>
              <CardDescription>Enter the details for the new corporate entity.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCorporateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="corp-name">Business Name</Label>
                    <Input
                      id="corp-name"
                      placeholder="e.g. Tech Solutions Ltd"
                      value={corporateData.name}
                      onChange={(e) => setCorporateData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-email">Email Address</Label>
                    <div className="flex items-center">
                      <Input
                        id="corp-email"
                        placeholder="admin"
                        className="rounded-r-none border-r-0"
                        value={corporateData.emailPrefix}
                        onChange={(e) => setCorporateData(prev => ({ ...prev, emailPrefix: e.target.value }))}
                        required
                      />
                      <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground whitespace-nowrap">
                        @parchipakistan.com
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-password">Password</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="corp-password"
                          type={showPassword ? "text" : "password"}
                          value={corporateData.password}
                          onChange={(e) => setCorporateData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => generatePassword('corporate')}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-contact-email">Contact Email</Label>
                    <Input
                      id="corp-contact-email"
                      type="email"
                      placeholder="contact@business.com"
                      value={corporateData.contactEmail}
                      onChange={(e) => setCorporateData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-logo">Business Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Input
                          id="corp-logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="cursor-pointer"
                          disabled={isLogoUploading}
                        />
                        {isLogoUploading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {corporateData.logoUrl && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          Uploaded
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Upload business logo (JPG, PNG)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-contact">Contact Phone</Label>
                    <Input
                      id="corp-contact"
                      placeholder="03001234567"
                      value={corporateData.contact}
                      onChange={(e) => setCorporateData(prev => ({ ...prev, contact: e.target.value.replace(/\D/g, '') }))}
                      maxLength={11}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-reg">Registration Number</Label>
                    <Input
                      id="corp-reg"
                      placeholder="Business Registration No."
                      value={corporateData.regNumber}
                      onChange={(e) => setCorporateData(prev => ({ ...prev, regNumber: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corp-category">Category</Label>
                    <Input
                      id="corp-category"
                      placeholder="e.g. Retail, Food, Tech"
                      value={corporateData.category}
                      onChange={(e) => setCorporateData(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="w-full md:w-auto" style={{ backgroundColor: colors.primary }} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Corporate Account"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch">
          {renderBranchForm()}
        </TabsContent>
      </Tabs>
    </div>
  )
}