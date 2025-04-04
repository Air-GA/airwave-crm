
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Permission = {
  name: string;
  description: string;
};

type Role = {
  name: string;
  description: string;
  permissions: string[];
};

export function RolePermissionsSettings() {
  const permissions: Permission[] = [
    { name: "View Financials", description: "Access to financial reports and data" },
    { name: "Customer Access", description: "View and manage customer information" },
    { name: "Create Work Orders", description: "Create new work orders" },
    { name: "Dispatch", description: "Dispatch technicians to jobs" },
    { name: "Limited Reports", description: "Access to basic reports" },
    { name: "View Customers", description: "View customer details" },
    { name: "Schedule Jobs", description: "Schedule and manage jobs" },
    { name: "View Work Orders", description: "Access to work order details" },
    { name: "Customer Messages", description: "Manage customer communications" },
    { name: "Assigned Work Orders", description: "View assigned work orders" },
    { name: "Timesheets", description: "Manage time tracking" },
    { name: "View Schedule", description: "View scheduling information" },
    { name: "Add Parts Used", description: "Record parts used for jobs" },
    { name: "All Permissions", description: "Full access to all system features" },
    { name: "Edit Permissions", description: "Change system permission settings" }
  ];

  const roles: Role[] = [
    {
      name: "Admin",
      description: "Full access to all system features and settings",
      permissions: ["All Permissions", "View Financials", "Edit Permissions"]
    },
    {
      name: "Manager",
      description: "Access to most features except company financials",
      permissions: ["Customer Access", "Create Work Orders", "Dispatch", "Limited Reports", "Edit Permissions"]
    },
    {
      name: "CSR",
      description: "Customer service tasks and scheduling",
      permissions: ["View Customers", "Schedule Jobs", "View Work Orders", "Customer Messages"]
    },
    {
      name: "Technician",
      description: "Field service and work order management",
      permissions: ["Assigned Work Orders", "Timesheets", "View Schedule", "Add Parts Used"]
    },
    {
      name: "Sales",
      description: "Sales-related activities and customer management",
      permissions: ["View Customers", "Create Work Orders", "Customer Messages", "Limited Reports"]
    },
    {
      name: "Customer",
      description: "Limited access for customers to view their information",
      permissions: ["Assigned Work Orders", "View Schedule"]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <p className="text-sm text-muted-foreground">Configure what each role can access</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{role.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {role.permissions.length} permissions
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Detailed Permissions Matrix</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.name} className="text-center">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.name}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{permission.name}</div>
                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                      </div>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.name} className="text-center">
                        {role.permissions.includes(permission.name) ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
