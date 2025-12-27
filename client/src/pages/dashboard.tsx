import { useQuery } from "@tanstack/react-query";
import { Building2, Wrench, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property, ServiceRequest } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  testId,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  testId: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={testId}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

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

export default function Dashboard() {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/requests"],
  });

  const openRequests = requests.filter((r) => r.status === "open").length;
  const inProgressRequests = requests.filter((r) => r.status === "in_progress").length;
  const completedRequests = requests.filter((r) => r.status === "completed").length;
  const urgentRequests = requests.filter(
    (r) => r.priority === "urgent" && r.status !== "completed"
  ).length;

  const recentRequests = [...requests]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  const isLoading = propertiesLoading || requestsLoading;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your properties and service requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Properties"
              value={properties.length}
              icon={Building2}
              description="Properties under management"
              testId="stat-total-properties"
            />
            <StatCard
              title="Open Requests"
              value={openRequests}
              icon={Clock}
              description="Awaiting action"
              testId="stat-open-requests"
            />
            <StatCard
              title="In Progress"
              value={inProgressRequests}
              icon={Wrench}
              description="Currently being worked on"
              testId="stat-in-progress"
            />
            <StatCard
              title="Completed"
              value={completedRequests}
              icon={CheckCircle2}
              description="Successfully resolved"
              testId="stat-completed"
            />
          </>
        )}
      </div>

      {urgentRequests > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Urgent Attention Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have <span className="font-semibold text-destructive">{urgentRequests}</span> urgent
              request{urgentRequests > 1 ? "s" : ""} that need immediate attention.
            </p>
            <Link href="/requests">
              <Button variant="outline" size="sm" className="mt-3" data-testid="button-view-urgent">
                View Urgent Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Recent Requests</CardTitle>
            <Link href="/requests">
              <Button variant="ghost" size="sm" data-testid="button-view-all-requests">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No service requests yet</p>
                <Link href="/requests/new">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-create-first-request">
                    Create First Request
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                    data-testid={`request-item-${request.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{request.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{request.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                        {request.priority}
                      </Badge>
                      <Badge variant={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Properties Overview</CardTitle>
            <Link href="/properties">
              <Button variant="ghost" size="sm" data-testid="button-view-all-properties">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No properties added yet</p>
                <Link href="/properties/new">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-add-first-property">
                    Add First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 5).map((property) => {
                  const propertyRequests = requests.filter(
                    (r) => r.propertyId === property.id && r.status !== "completed"
                  ).length;
                  return (
                    <div
                      key={property.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                      data-testid={`property-item-${property.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{property.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{property.address}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Badge variant="outline" className="capitalize">{property.type}</Badge>
                        {propertyRequests > 0 && (
                          <Badge variant="secondary">
                            {propertyRequests} open
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
