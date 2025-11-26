"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, RefreshCw, Building2, Store, Upload, Loader2 } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { SupabaseStorageService } from "@/lib/storage"

interface AccountCreationProps {
  role?: 'admin' | 'corporate'
  corporateId?: string
}

export function AccountCreation({ role = 'admin', corporateId }: AccountCreationProps) {
  const colors = DASHBOARD_COLORS(role === 'corporate' ? 'corporate' : 'admin')
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

  // Mock corporate accounts for linking
  const corporateAccounts = [
    { id: "c1", name: "Tech Solutions Ltd", slug: "tech" },
    { id: "c2", name: "Global Retail Inc", slug: "global" },
    { id: "c3", name: "Food Chain Co", slug: "food" },
  ]

  const getCorporateSlug = () => {
    const selectedId = role === 'corporate' && corporateId ? corporateId : branchData.linkedCorporate
    const corporate = corporateAccounts.find(c => c.id === selectedId)
    return corporate ? `${corporate.slug}-` : ""
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
      // Use a temporary name if business name is empty
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
      console.log("Creating Corporate Account:", {
        ...corporateData,
        email: `${corporateData.emailPrefix}@parchipakistan.com`,
        logo_path: corporateData.logoUrl
      })
      // Add API call here
    } catch (error) {
      console.error("Error creating account:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const slug = getCorporateSlug()
    const completeEmail = `${slug}${branchData.emailPrefix}@parchipakistan.com`
    
    console.log("Creating Branch Account:", {
      ...branchData,
      email: completeEmail
    })
    // Add API call here
  }

  const BranchForm = () => (
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
                  onValueChange={(value) => setBranchData(prev => ({ ...prev, linkedCorporate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a corporate entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {corporateAccounts.map(corp => (
                      <SelectItem key={corp.id} value={corp.id}>{corp.name}</SelectItem>
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
                <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground whitespace-nowrap">
                  {getCorporateSlug()}
                </div>
                <Input 
                  id="branch-email" 
                  placeholder="downtown" 
                  className="rounded-none border-x-0"
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
                placeholder="+92 300 1234567" 
                value={branchData.contact}
                onChange={(e) => setBranchData(prev => ({ ...prev, contact: e.target.value }))}
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
            <Button type="submit" className="w-full md:w-auto" style={{ backgroundColor: colors.primary }}>
              Create Branch Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  if (role === 'corporate') {
    return (
      <div className="max-w-4xl mx-auto">
        <BranchForm />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="+92 300 1234567" 
                      value={corporateData.contact}
                      onChange={(e) => setCorporateData(prev => ({ ...prev, contact: e.target.value }))}
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
          <BranchForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
