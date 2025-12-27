import { useQuery, useMutation } from "@tanstack/react-query";
import { Wrench, Plus, Filter, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Property, ServiceRequest } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "open":
      return "secondary";
    case "in_progress":
      return "default";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "open":
      return Clock;
    case "in_progress":
      return Wrench;
    case "completed":
      return CheckCircle2;
    default:
      return Clock;
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    plumbing: "Plumbing",
    electrical: "Electrical",
    hvac: "HVAC",
    general: "General Maintenance",
    appliance: "Appliance",
    structural: "Structural",
    pest: "Pest Control",
    other: "Other",
  };
  return labels[category] || category;
}

export default function Requests() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { data: requests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/requests"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Status updated",
        description: "The request status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    if (priorityFilter !== "all" && request.priority !== priorityFilter) return false;
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { open: 0, in_progress: 1, completed: 2 };
    
    if (statusOrder[a.status as keyof typeof statusOrder] !== statusOrder[b.status as keyof typeof statusOrder]) {
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    }
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-requests-title">Service Requests</h1>
          <p className="text-muted-foreground">
            Track and manage all service requests across your properties.
          </p>
        </div>
        <Link href="/requests/new">
          <Button className="gap-2" data-testid="button-new-request">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-priority-filter">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter !== "all" || priorityFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            data-testid="button-clear-filters"
          >
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {statusFilter !== "all" || priorityFilter !== "all"
                ? "No matching requests"
                : "No service requests yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              {statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters to see more requests."
                : "Create a service request to report maintenance issues or request services for your properties."}
            </p>
            {statusFilter === "all" && priorityFilter === "all" && (
              <Link href="/requests/new">
                <Button className="gap-2" data-testid="button-create-first-request">
                  <Plus className="h-4 w-4" />
                  Create First Request
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <Card key={request.id} data-testid={`card-request-${request.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted shrink-0">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium" data-testid={`text-request-title-${request.id}`}>
                            {request.title}
                          </h3>
                          <p className="text-sm text-muted-foreground" data-testid={`text-request-property-${request.id}`}>
                            {getPropertyName(request.propertyId)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                            {request.priority}
                          </Badge>
                          <Badge variant={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2" data-testid={`text-request-description-${request.id}`}>
                        {request.description}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t">
                        <Badge variant="outline" className="font-normal">
                          {getCategoryLabel(request.category)}
                        </Badge>
                        {request.status !== "completed" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`button-update-status-${request.id}`}>
                                Update Status
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {request.status !== "open" && (
                                <DropdownMenuItem
                                  onClick={() => updateMutation.mutate({ id: request.id, status: "open" })}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Open
                                </DropdownMenuItem>
                              )}
                              {request.status !== "in_progress" && (
                                <DropdownMenuItem
                                  onClick={() => updateMutation.mutate({ id: request.id, status: "in_progress" })}
                                >
                                  <Wrench className="h-4 w-4 mr-2" />
                                  Mark In Progress
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => updateMutation.mutate({ id: request.id, status: "completed" })}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
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
