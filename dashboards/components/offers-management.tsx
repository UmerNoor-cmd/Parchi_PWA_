"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

const mockOffers = [
  {
    id: 1,
    title: "Weekend Special - 20% off",
    discount: "20%",
    type: "percentage",
    minOrder: "Rs. 500",
    validUntil: "2024-12-31",
    redemptions: "145/200",
    branches: 4,
    status: "active",
  },
  {
    id: 2,
    title: "Happy Hour Combo",
    discount: "Rs. 200",
    type: "fixed",
    minOrder: "Rs. 1000",
    validUntil: "2024-12-15",
    redemptions: "89/150",
    branches: 2,
    status: "active",
  },
  {
    id: 3,
    title: "Student Special",
    discount: "15%",
    type: "percentage",
    minOrder: "Rs. 300",
    validUntil: "2024-12-10",
    redemptions: "220/300",
    branches: 4,
    status: "active",
  },
]

export function OffersManagement() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Offers</CardTitle>
          <CardDescription>Create and manage offers across all branches</CardDescription>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Offer
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockOffers.map((offer) => (
            <div key={offer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{offer.title}</h4>
                    <Badge variant={offer.status === "active" ? "default" : "secondary"}>{offer.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Discount</p>
                      <p className="font-semibold text-primary">{offer.discount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Min. Order</p>
                      <p className="font-semibold">{offer.minOrder}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Redemptions</p>
                      <p className="font-semibold">{offer.redemptions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Branches</p>
                      <p className="font-semibold">{offer.branches}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
