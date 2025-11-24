"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Store, MoreHorizontal, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock Data
const mockBranches = [
  { id: 1, name: "Downtown Branch", location: "Main St, Downtown", city: "Karachi", status: "active", manager: "Ali Khan" },
  { id: 2, name: "Mall Branch", location: "Dolmen Mall, Clifton", city: "Karachi", status: "active", manager: "Sara Ahmed" },
  { id: 3, name: "University Road", location: "Opposite NED", city: "Karachi", status: "inactive", manager: "N/A" },
]

export function CorporateBranches() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Branches</h2>
          <p className="text-muted-foreground">Manage your branch locations</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Branch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Directory</CardTitle>
          <CardDescription>
            A list of all your operating branches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search branches..."
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {branch.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {branch.location}
                      </div>
                    </TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>
                      <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                        {branch.status}
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
                          <DropdownMenuItem>View Performance</DropdownMenuItem>
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

      {/* Create Branch Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Register a new branch location for your business.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input placeholder="e.g. Downtown Branch" />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="Full street address" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="e.g. Karachi" />
              </div>
              <div className="space-y-2">
                <Label>Manager Name</Label>
                <Input placeholder="Branch Manager" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input placeholder="+92 300 1234567" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateOpen(false)}>Add Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
