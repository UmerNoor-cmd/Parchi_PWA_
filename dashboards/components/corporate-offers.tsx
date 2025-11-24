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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Ticket, MoreHorizontal, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock Data
const mockOffers = [
  { id: 1, title: "20% Off All Items", type: "Percentage", value: "20%", status: "active", expiry: "2024-12-31" },
  { id: 2, title: "Lunch Deal", type: "Fixed", value: "Rs. 500", status: "expired", expiry: "2023-10-01" },
]

const mockBranches = [
  { id: 1, name: "Downtown Branch" },
  { id: 2, name: "Mall Branch" },
  { id: 3, name: "University Road" },
]

export function CorporateOffers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isBranchSpecific, setIsBranchSpecific] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState<number[]>([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Offers</h2>
          <p className="text-muted-foreground">Manage your discount offers</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Past Offers</CardTitle>
          <CardDescription>
            A list of all offers created for your branches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search offers..."
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        {offer.title}
                      </div>
                    </TableCell>
                    <TableCell>{offer.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {offer.expiry}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.status === "active" ? "default" : "secondary"}>
                        {offer.status}
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
                          <DropdownMenuItem>Edit Offer</DropdownMenuItem>
                          <DropdownMenuItem>View Stats</DropdownMenuItem>
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

      {/* Create Offer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
            <DialogDescription>
              Set up a new discount offer for your customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Offer Title</Label>
              <Input placeholder="e.g. Flat 20% Off" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (Rs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" placeholder="e.g. 20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Brief description of the offer" />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="branch-specific" 
                  checked={isBranchSpecific}
                  onCheckedChange={(checked) => {
                    setIsBranchSpecific(checked as boolean)
                    if (!checked) setSelectedBranches([])
                  }}
                />
                <Label htmlFor="branch-specific" className="text-sm font-normal cursor-pointer">
                  Make this offer branch-specific
                </Label>
              </div>

              {isBranchSpecific && (
                <div className="space-y-2 pl-6">
                  <Label>Select Branches</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {mockBranches.map((branch) => (
                      <div key={branch.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`branch-${branch.id}`}
                          checked={selectedBranches.includes(branch.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBranches([...selectedBranches, branch.id])
                            } else {
                              setSelectedBranches(selectedBranches.filter(id => id !== branch.id))
                            }
                          }}
                        />
                        <Label htmlFor={`branch-${branch.id}`} className="text-sm font-normal cursor-pointer">
                          {branch.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedBranches.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedBranches.length} branch{selectedBranches.length > 1 ? 'es' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateOpen(false)}>Create Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
