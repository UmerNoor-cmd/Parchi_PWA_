"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Store, MoreHorizontal, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMerchants } from "@/hooks/use-merchants"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdminMerchants() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [merchantType, setMerchantType] = useState<"corporate" | "branch">("corporate")
  const [searchQuery, setSearchQuery] = useState("")
  const { merchants, loading, error, refetch } = useMerchants()

  // Filter merchants based on search query
  const filteredMerchants = merchants.filter((merchant) =>
    merchant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.contactPhone.includes(searchQuery)
  )

  // Get verification status badge variant
  const getStatusVariant = (status: string | null, isActive: boolean | null) => {
    if (!isActive) return "secondary"
    if (status === "approved") return "default"
    if (status === "pending") return "secondary"
    return "secondary"
  }

  // Get status display text
  const getStatusText = (status: string | null, isActive: boolean | null) => {
    if (!isActive) return "Inactive"
    if (status === "approved") return "Active"
    if (status === "pending") return "Pending"
    return status || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchant Management</h2>
          <p className="text-muted-foreground">Create and manage corporate and branch accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Corporate Merchants Directory</CardTitle>
              <CardDescription>
                A list of all registered corporate merchant accounts.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center py-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading merchants...</span>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No merchants found matching your search.' : 'No corporate merchants found.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Verification Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <div>
                            <div>{merchant.businessName}</div>
                            {merchant.businessRegistrationNumber && (
                              <div className="text-xs text-muted-foreground">
                                Reg: {merchant.businessRegistrationNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{merchant.contactEmail}</div>
                          <div className="text-muted-foreground">{merchant.contactPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {merchant.category || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(merchant.verificationStatus, merchant.isActive)}>
                          {getStatusText(merchant.verificationStatus, merchant.isActive)}
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
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Dashboard</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              {merchant.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Merchant Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Merchant</DialogTitle>
            <DialogDescription>
              Create a new corporate account or branch location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select 
                value={merchantType} 
                onValueChange={(val: "corporate" | "branch") => setMerchantType(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Corporate Account</SelectItem>
                  <SelectItem value="branch">Branch Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {merchantType === "branch" && (
              <div className="space-y-2">
                <Label>Parent Corporation</Label>
                <Select disabled={loading || merchants.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading..." : merchants.length === 0 ? "No corporations available" : "Select corporation"} />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map(corp => (
                      <SelectItem key={corp.id} value={corp.id}>
                        {corp.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{merchantType === "corporate" ? "Business Name" : "Branch Name"}</Label>
              <Input placeholder={merchantType === "corporate" ? "e.g. Burger Hub" : "e.g. Downtown Branch"} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="contact@example.com" />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+92 300 1234567" />
            </div>

            {merchantType === "branch" && (
              <>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label>Coordinates (Optional)</Label>
                    <Input placeholder="Lat, Long" />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateOpen(false)}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
