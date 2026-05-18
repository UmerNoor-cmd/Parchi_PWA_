"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  User, 
  RefreshCw, 
  Edit, 
  Trophy, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  Shield,
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getStudentDetailsForReview, 
  updateStudentAdmin, 
  updateStudentSelfie,
  StudentDetail,
  Institute
} from "@/lib/api-client"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface StudentProfileModalProps {
  studentId: string | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  availableInstitutes: Institute[]
}

export function StudentProfileModal({ 
  studentId, 
  isOpen, 
  onClose, 
  onUpdate,
  availableInstitutes 
}: StudentProfileModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Edit Profile State
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    university: "",
    gender: "",
    degree: "",
    yearOfStudy: "",
    verificationStatus: "",
    isFoundersClub: false,
    notes: ""
  })

  // Selfie Replace State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudentDetails()
    } else {
      setStudent(null)
      setActiveTab("overview")
    }
  }, [isOpen, studentId])

  const loadStudentDetails = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const details = await getStudentDetailsForReview(studentId)
      setStudent(details)
      setEditForm({
        firstName: details.firstName || "",
        lastName: details.lastName || "",
        email: details.email || "",
        phone: details.phone || "",
        university: details.university || "",
        gender: details.gender || "not-set",
        degree: details.degree || "",
        yearOfStudy: details.yearOfStudy || "",
        verificationStatus: details.verificationStatus || "pending",
        isFoundersClub: details.isFoundersClub || false,
        notes: details.adminNotes || "",
        profilePicture: details.profilePicture || "",
        verificationSelfiePath: details.verificationSelfiePath || ""
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive"
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!studentId) return
    setSaving(true)
    try {
      await updateStudentAdmin(studentId, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        university: editForm.university,
        gender: editForm.gender === "not-set" ? null : editForm.gender,
        degree: editForm.degree,
        yearOfStudy: editForm.yearOfStudy,
        verificationStatus: editForm.verificationStatus as any,
        isFoundersClub: editForm.isFoundersClub,
        notes: editForm.notes,
        profilePicture: editForm.profilePicture || null,
        verificationSelfiePath: editForm.verificationSelfiePath || null
      })
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
      onUpdate?.()
      loadStudentDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleReplaceSelfie = async () => {
    if (!studentId || !selectedFile) return
    setSaving(true)
    try {
      await updateStudentSelfie(studentId, selectedFile)
      toast({
        title: "Success",
        description: "KYC selfie replaced successfully"
      })
      setSelectedFile(null)
      setPreviewUrl(null)
      loadStudentDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to replace selfie",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><X className="w-3 h-3 mr-1" /> Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Student Profile Details</DialogTitle>
          <DialogDescription>Manage student information, KYC, and redemptions.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : student ? (
          <div className="flex flex-col">
            {/* Modal Header/Hero */}
            <div className="bg-slate-50 border-b p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-sm">
                  <AvatarImage src={student.profilePicture || student.verificationSelfiePath || student.kyc?.selfieImagePath || ""} alt={student.firstName} className="object-cover" />
                  <AvatarFallback className="bg-slate-200 text-slate-500 text-2xl">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <DialogHeader className="p-0">
                    <div className="flex items-center gap-3">
                      <DialogTitle className="text-2xl font-bold">{student.firstName} {student.lastName}</DialogTitle>
                      {getStatusBadge(student.verificationStatus)}
                    </div>
                    <DialogDescription className="sr-only">
                      Student profile details and management for {student.firstName} {student.lastName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md border text-slate-700 font-mono text-xs">
                      <Shield className="w-3 h-3" />
                      {student.parchiId}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Joined {format(new Date(student.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {student.university}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rank</div>
                  <div className="text-3xl font-black text-slate-800 flex items-center justify-end gap-1">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    #{student.leaderboardRank || "-"}
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <div className="px-6 border-b bg-white sticky top-0 z-10">
                <TabsList className="bg-transparent h-14 p-0 gap-8">
                  <TabsTrigger 
                    value="overview" 
                    className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-semibold"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="redemptions" 
                    className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-semibold"
                  >
                    Redemptions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="edit" 
                    className="h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-semibold"
                  >
                    Edit Profile
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Redemptions", value: student.totalRedemptions, icon: RefreshCw, color: "text-blue-600" },
                      { label: "Total Savings", value: `₨${student.totalSavings?.toLocaleString()}`, icon: Award, color: "text-green-600" },
                      { label: "Account Age", value: `${student.accountAgeDays} Days`, icon: Clock, color: "text-purple-600" },
                      { label: "Founders Club", value: student.isFoundersClub ? "Member" : "No", icon: Shield, color: student.isFoundersClub ? "text-amber-600" : "text-slate-400" },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-white border rounded-xl shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <stat.icon className={cn("w-4 h-4", stat.color)} />
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Loyalty Progress */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Loyalty Progress
                      </h3>
                      <div className="space-y-4">
                        {student.loyaltyProgress && student.loyaltyProgress.length > 0 ? (
                          student.loyaltyProgress.map((prog, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6 border">
                                    <AvatarImage src={prog.merchantLogo || ""} />
                                    <AvatarFallback>{prog.merchantName[0]}</AvatarFallback>
                                  </Avatar>
                                  <span>{prog.merchantName}</span>
                                </div>
                                <span className="text-muted-foreground">{prog.current} / {prog.goal}</span>
                              </div>
                              <Progress value={prog.percentage} className="h-2" />
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed">
                            <p className="text-sm text-muted-foreground">No loyalty data available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Redemptions Timeline */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Last 5 Redemptions
                      </h3>
                      <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {student.recentRedemptions && student.recentRedemptions.length > 0 ? (
                          student.recentRedemptions.map((red, i) => (
                            <div key={i} className="relative pl-8 space-y-1">
                              <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-blue-500 ring-1 ring-slate-200" />
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">{red.merchantName}</span>
                                <span className="text-[10px] text-muted-foreground">{format(new Date(red.date), "MMM d, h:mm a")}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {red.offerTitle} • {red.branchName}
                                {red.isBonusApplied && (
                                  <Badge className="ml-2 bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 text-[10px] h-4 py-0">Bonus Applied</Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed">
                            <p className="text-sm text-muted-foreground">No recent redemptions</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-500" />
                      Location Activity
                    </h3>
                    <div className="h-48 bg-slate-100 rounded-xl border flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 grayscale" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                      <MapPin className="w-8 h-8 text-slate-400" />
                      <div className="text-sm text-slate-500 font-medium">{student.university} Area</div>
                      <div className="text-[10px] text-slate-400">Map visualization coming soon</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="redemptions" className="mt-0">
                  <div className="border rounded-xl overflow-hidden bg-white">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Merchant & Branch</TableHead>
                          <TableHead>Offer Details</TableHead>
                          <TableHead className="text-right">Bonus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.recentRedemptions && student.recentRedemptions.length > 0 ? (
                          student.recentRedemptions.map((red) => (
                            <TableRow key={red.id}>
                              <TableCell className="font-medium">
                                {format(new Date(red.date), "MMM d, yyyy")}
                                <div className="text-[10px] text-muted-foreground">{format(new Date(red.date), "h:mm a")}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold">{red.merchantName}</div>
                                <div className="text-xs text-muted-foreground">{red.branchName}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{red.offerTitle}</div>
                              </TableCell>
                              <TableCell className="text-right">
                                {red.isBonusApplied ? (
                                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Yes</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">No</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                              No redemption history found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="edit" className="mt-0 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Parchi ID</Label>
                          <div className="h-10 px-3 py-2 bg-slate-100 border rounded-md text-slate-500 font-mono text-sm flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            {student.parchiId}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select value={editForm.gender} onValueChange={v => setEditForm({...editForm, gender: v})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                              <SelectItem value="not-set">Not Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Academic & Status</h4>
                      <div className="space-y-2">
                        <Label>University</Label>
                        <Select value={editForm.university} onValueChange={v => setEditForm({...editForm, university: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select University" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableInstitutes.map(inst => (
                              <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>
                            ))}
                            <SelectItem value={student.university}>{student.university}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree / Program</Label>
                          <Input value={editForm.degree} onChange={e => setEditForm({...editForm, degree: e.target.value})} placeholder="e.g. BSCS" />
                        </div>
                        <div className="space-y-2">
                          <Label>Year of Study</Label>
                          <Select value={editForm.yearOfStudy} onValueChange={v => setEditForm({...editForm, yearOfStudy: v})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st Year">1st Year</SelectItem>
                              <SelectItem value="2nd Year">2nd Year</SelectItem>
                              <SelectItem value="3rd Year">3rd Year</SelectItem>
                              <SelectItem value="4th Year">4th Year</SelectItem>
                              <SelectItem value="5th Year">5th Year</SelectItem>
                              <SelectItem value="Graduated">Graduated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>KYC Status (Admin Override)</Label>
                        <Select value={editForm.verificationStatus} onValueChange={v => setEditForm({...editForm, verificationStatus: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Founders Club</Label>
                          <p className="text-xs text-muted-foreground">Special status for early adopters</p>
                        </div>
                        <Switch checked={editForm.isFoundersClub} onCheckedChange={v => setEditForm({...editForm, isFoundersClub: v})} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Profile Picture URL</Label>
                      <Input 
                        value={editForm.profilePicture} 
                        onChange={e => setEditForm({...editForm, profilePicture: e.target.value})} 
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Verification Selfie URL (Direct)</Label>
                      <Input 
                        value={editForm.verificationSelfiePath} 
                        onChange={e => setEditForm({...editForm, verificationSelfiePath: e.target.value})} 
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea 
                      placeholder="Add internal notes about this student..." 
                      className="min-h-[100px]"
                      value={editForm.notes}
                      onChange={e => setEditForm({...editForm, notes: e.target.value})}
                    />
                  </div>

                  {/* KYC Selfie Replace Section */}
                  <div className="p-6 bg-slate-50 border rounded-xl space-y-4">
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      KYC Selfie Change
                    </h4>
                    
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                          <AvatarImage src={previewUrl || student.verificationSelfiePath || student.kyc?.selfieImagePath || student.profilePicture || ""} className="object-cover" />
                          <AvatarFallback>KYC</AvatarFallback>
                        </Avatar>
                        {previewUrl && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center rounded-full">
                            <Badge className="bg-blue-600">Preview</Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Replace the official KYC selfie. This will update the primary avatar and be logged in audit history.
                        </div>
                        <div className="flex items-center gap-3">
                          {!selectedFile ? (
                            <Button variant="outline" className="gap-2" onClick={() => document.getElementById('selfie-upload')?.click()}>
                              <Upload className="w-4 h-4" />
                              Replace Selfie
                            </Button>
                          ) : (
                            <>
                              <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={handleReplaceSelfie} disabled={saving}>
                                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                Confirm Replace
                              </Button>
                              <Button variant="ghost" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>
                                Cancel
                              </Button>
                            </>
                          )}
                          <input 
                            type="file" 
                            id="selfie-upload" 
                            className="hidden" 
                            accept="image/jpeg,image/png"
                            onChange={handleFileSelect}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving && <RefreshCw className="w-4 h-4 animate-spin mr-2" />}
                      Save Profile Changes
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
