import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Wrench, ArrowLeft, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertServiceRequestSchema, type InsertServiceRequest, type Property } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { z } from "zod";

const formSchema = insertServiceRequestSchema.extend({
  propertyId: z.string().min(1, "Please select a property"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
});

const categories = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC / Heating & Cooling" },
  { value: "appliance", label: "Appliance Repair" },
  { value: "structural", label: "Structural / Building" },
  { value: "pest", label: "Pest Control" },
  { value: "general", label: "General Maintenance" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low", description: "Can wait a few weeks" },
  { value: "medium", label: "Medium", description: "Should be addressed within a week" },
  { value: "high", label: "High", description: "Needs attention within 24-48 hours" },
  { value: "urgent", label: "Urgent", description: "Emergency - immediate attention required" },
];

export default function RequestForm() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(search);
  const preselectedPropertyId = searchParams.get("propertyId") || "";

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<InsertServiceRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: preselectedPropertyId,
      title: "",
      description: "",
      category: "",
      priority: "medium",
      status: "open",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertServiceRequest) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Request submitted",
        description: "Your service request has been submitted successfully.",
      });
      setLocation("/requests");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertServiceRequest) => {
    mutation.mutate(data);
  };

  if (propertiesLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-72" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/requests">
            <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="button-back-requests">
              <ArrowLeft className="h-4 w-4" />
              Back to Requests
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">New Service Request</h1>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Available</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              You need to add a property before creating a service request.
            </p>
            <Link href="/properties/new">
              <Button className="gap-2" data-testid="button-add-property-first">
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/requests">
          <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="button-back-requests">
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-new-request-title">New Service Request</h1>
        <p className="text-muted-foreground mt-2">
          Submit a service request for maintenance or repairs at your property.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Provide details about the issue or service needed</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-property">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - {property.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Leaking faucet in kitchen"
                        data-testid="input-request-title"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief summary of the issue or service needed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-priority">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex flex-col">
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {priorities.find((p) => p.value === field.value)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe the issue in detail. Include location, when it started, and any other relevant information..."
                        className="min-h-32 resize-none"
                        data-testid="input-request-description"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the better we can assist you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit-request"
                >
                  {mutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Link href="/requests">
                  <Button type="button" variant="outline" data-testid="button-cancel-request">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
