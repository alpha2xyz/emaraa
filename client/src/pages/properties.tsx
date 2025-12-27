import { useQuery, useMutation } from "@tanstack/react-query";
import { Building2, Plus, MapPin, Home, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Property, ServiceRequest } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function getPropertyIcon(type: string) {
  switch (type) {
    case "apartment":
      return Building2;
    case "house":
      return Home;
    case "commercial":
      return Building2;
    default:
      return Building2;
  }
}

export default function Properties() {
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: requests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/requests"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property deleted",
        description: "The property has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getOpenRequestsCount = (propertyId: string) => {
    return requests.filter(
      (r) => r.propertyId === propertyId && r.status !== "completed"
    ).length;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-properties-title">Properties</h1>
          <p className="text-muted-foreground">
            Manage your properties and track their service requests.
          </p>
        </div>
        <Link href="/properties/new">
          <Button className="gap-2" data-testid="button-add-property">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Get started by adding your first property. You can then create service requests for it.
            </p>
            <Link href="/properties/new">
              <Button className="gap-2" data-testid="button-add-first-property">
                <Plus className="h-4 w-4" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const Icon = getPropertyIcon(property.type);
            const openRequests = getOpenRequestsCount(property.id);
            return (
              <Card key={property.id} className="group" data-testid={`card-property-${property.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base" data-testid={`text-property-name-${property.id}`}>
                        {property.name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {property.type}
                      </Badge>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-property-${property.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{property.name}"? This action cannot be undone.
                          All associated service requests will also be removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(property.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span data-testid={`text-property-address-${property.id}`}>{property.address}</span>
                  </div>
                  {property.units && property.units > 1 && (
                    <p className="text-sm text-muted-foreground">
                      {property.units} units
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      {openRequests > 0 ? (
                        <span>
                          <span className="font-medium text-foreground">{openRequests}</span> open request{openRequests > 1 ? "s" : ""}
                        </span>
                      ) : (
                        "No open requests"
                      )}
                    </span>
                    <Link href={`/requests/new?propertyId=${property.id}`}>
                      <Button variant="ghost" size="sm" data-testid={`button-new-request-${property.id}`}>
                        New Request
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
