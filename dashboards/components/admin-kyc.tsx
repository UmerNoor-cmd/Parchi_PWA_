"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Search, Eye, MoreHorizontal, FileText, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock Data
const mockPendingStudents = [
  {
    id: 1,
    name: "Ahmed Ali",
    university: "FAST-NUCES",
    parchiId: "PK-12345",
    submittedAt: "2023-11-24T10:00:00",
    studentIdImage: "/placeholder.svg?height=300&width=500",
    selfieImage: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Fatima Khan",
    university: "IBA",
    parchiId: "PK-67890",
    submittedAt: "2023-11-24T11:30:00",
    studentIdImage: "/placeholder.svg?height=300&width=500",
    selfieImage: "/placeholder.svg?height=300&width=300",
  },
]

const mockAllStudents = [
  { id: 1, name: "Hassan Saeed", university: "LUMS", parchiId: "PK-11111", status: "verified", email: "hassan@example.com" },
  { id: 2, name: "Zara Ahmed", university: "FAST-NUCES", parchiId: "PK-22222", status: "verified", email: "zara@example.com" },
  { id: 3, name: "Bilal Khan", university: "NUST", parchiId: "PK-33333", status: "rejected", email: "bilal@example.com" },
]

export function AdminKYC() {
  const [selectedStudent, setSelectedStudent] = useState<typeof mockPendingStudents[0] | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const handleReview = (student: typeof mockPendingStudents[0]) => {
    setSelectedStudent(student)
    setIsReviewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student KYC</h2>
          <p className="text-muted-foreground">Manage student verifications and records</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals ({mockPendingStudents.length})</TabsTrigger>
          <TabsTrigger value="all">All Students</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPendingStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {student.name}
                  </CardTitle>
                  <Badge variant="outline">Pending</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.university}</div>
                  <p className="text-xs text-muted-foreground">
                    ID: {student.parchiId}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button className="w-full" onClick={() => handleReview(student)}>
                      <Eye className="mr-2 h-4 w-4" /> Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Database</CardTitle>
              <CardDescription>
                A list of all registered students and their verification status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4">
                <Input
                  placeholder="Filter students..."
                  className="max-w-sm"
                />
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Parchi ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAllStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.university}</TableCell>
                        <TableCell>{student.parchiId}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "verified" ? "default" : "destructive"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Record</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review KYC Application</DialogTitle>
            <DialogDescription>
              Verify the student ID and selfie match for {selectedStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label>Student ID Card</Label>
                <div className="border rounded-lg p-2 bg-muted/20">
                  <img 
                    src={selectedStudent.studentIdImage} 
                    alt="Student ID" 
                    className="w-full h-auto rounded-md object-contain max-h-[300px]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Selfie</Label>
                <div className="border rounded-lg p-2 bg-muted/20">
                  <img 
                    src={selectedStudent.selfieImage} 
                    alt="Selfie" 
                    className="w-full h-auto rounded-md object-contain max-h-[300px]"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">University</Label>
                  <p className="font-medium">{selectedStudent.university}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Parchi ID</Label>
                  <p className="font-medium">{selectedStudent.parchiId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted At</Label>
                  <p className="font-medium">{new Date(selectedStudent.submittedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="destructive" onClick={() => setIsReviewOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button onClick={() => setIsReviewOpen(false)}>
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
