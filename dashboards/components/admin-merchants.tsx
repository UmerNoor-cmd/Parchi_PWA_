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
import { Plus, Building2, Store, MoreHorizontal, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock Data
const mockMerchants = [
  { id: 1, name: "Burger Hub", type: "Corporate", branches: 4, status: "active", email: "contact@burgerhub.com" },
  { id: 2, name: "Pizza Palace", type: "Corporate", branches: 2, status: "active", email: "info@pizzapalace.com" },
  { id: 3, name: "Burger Hub - Downtown", type: "Branch", parent: "Burger Hub", status: "active", location: "Downtown" },
  { id: 4, name: "Coffee Corner", type: "Corporate", branches: 1, status: "pending", email: "hello@coffeecorner.com" },
]

const mockCorporates = [
  { id: 1, name: "Burger Hub" },
  { id: 2, name: "Pizza Palace" },
  { id: 4, name: "Coffee Corner" },
]

export function AdminMerchants() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [merchantType, setMerchantType] = useState<"corporate" | "branch">("corporate")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchant Management</h2>
          <p className="text-muted-foreground">Create and manage corporate and branch accounts</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Merchant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merchants Directory</CardTitle>
          <CardDescription>
            A list of all registered merchants and branches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search merchants..."
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMerchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {merchant.type === "Corporate" ? (
                          <Building2 className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Store className="h-4 w-4 text-green-500" />
                        )}
                        {merchant.name}
                      </div>
                    </TableCell>
                    <TableCell>{merchant.type}</TableCell>
                    <TableCell>
                      {merchant.type === "Corporate" ? (
                        <span className="text-muted-foreground">{merchant.branches} Branches</span>
                      ) : (
                        <span className="text-muted-foreground">Parent: {merchant.parent}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={merchant.status === "active" ? "default" : "secondary"}>
                        {merchant.status}
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select corporation" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCorporates.map(corp => (
                      <SelectItem key={corp.id} value={corp.id.toString()}>{corp.name}</SelectItem>
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
