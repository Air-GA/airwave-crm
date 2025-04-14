
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertCircle,
  ChevronDown, 
  Download, 
  Eye, 
  Filter, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Printer, 
  Search, 
  Send,
  ReceiptText,
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { userRole, permissions } = useAuth();
  
  // Only admins can see profit information
  const canViewProfitNumbers = userRole === 'admin';
  
  // Mock data for invoices
  const invoices = [
    {
      id: "INV-2023-001",
      customer: "John Smith",
      amount: 285.99,
      date: "2023-08-15",
      dueDate: "2023-09-15",
      status: "paid",
      serviceType: "Maintenance",
      workOrderId: "WO-23-1547"
    },
    {
      id: "INV-2023-002",
      customer: "Sarah Wilson",
      amount: 593.50,
      date: "2023-08-18",
      dueDate: "2023-09-18",
      status: "pending",
      serviceType: "Repair",
      workOrderId: "WO-23-1548"
    },
    {
      id: "INV-2023-003",
      customer: "Robert Brown",
      amount: 1875.00,
      date: "2023-08-20",
      dueDate: "2023-09-20",
      status: "overdue",
      serviceType: "Installation",
      workOrderId: "WO-23-1549"
    },
    {
      id: "INV-2023-004",
      customer: "Emily Davis",
      amount: 145.75,
      date: "2023-08-22",
      dueDate: "2023-09-22",
      status: "paid",
      serviceType: "Maintenance",
      workOrderId: "WO-23-1550"
    },
    {
      id: "INV-2023-005",
      customer: "Michael Johnson",
      amount: 729.99,
      date: "2023-08-25",
      dueDate: "2023-09-25",
      status: "pending",
      serviceType: "Repair",
      workOrderId: "WO-23-1551"
    },
    {
      id: "INV-2023-006",
      customer: "Jessica White",
      amount: 2450.00,
      date: "2023-08-28",
      dueDate: "2023-09-28",
      status: "draft",
      serviceType: "Installation",
      workOrderId: "WO-23-1552"
    },
  ];
  
  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => 
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.workOrderId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage billing and payments</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Total Invoices</div>
            <div className="mt-2 text-2xl font-bold">{invoices.length}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Pending Payment</div>
            <div className="mt-2 text-2xl font-bold text-amber-500">
              ${invoices
                .filter(i => i.status === 'pending')
                .reduce((sum, i) => sum + i.amount, 0)
                .toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Overdue</div>
            <div className="mt-2 text-2xl font-bold text-red-500">
              ${invoices
                .filter(i => i.status === 'overdue')
                .reduce((sum, i) => sum + i.amount, 0)
                .toFixed(2)}
            </div>
          </div>
          
          {/* Only show profit metrics to admin users */}
          {canViewProfitNumbers ? (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Profit (This Month)</div>
              <div className="mt-2 text-2xl font-bold text-green-500">
                ${(invoices
                  .filter(i => i.status === 'paid')
                  .reduce((sum, i) => sum + i.amount, 0) * 0.35) // Example profit margin of 35%
                  .toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Paid (This Month)</div>
              <div className="mt-2 text-2xl font-bold text-green-500">
                ${invoices
                  .filter(i => i.status === 'paid')
                  .reduce((sum, i) => sum + i.amount, 0)
                  .toFixed(2)}
              </div>
            </div>
          )}
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8 w-full md:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All Statuses</DropdownMenuItem>
                <DropdownMenuItem>Paid</DropdownMenuItem>
                <DropdownMenuItem>Pending</DropdownMenuItem>
                <DropdownMenuItem>Overdue</DropdownMenuItem>
                <DropdownMenuItem>Draft</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline">
              <Filter className="mr-1 h-4 w-4" /> Date Range
            </Button>
            
            {/* AutoPay filter */}
            <Button variant="outline">
              <CreditCard className="mr-1 h-4 w-4" /> AutoPay Status
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <span>{filteredInvoices.length} invoices</span>
          </div>
        </div>
        
        {/* Invoices table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                
                {/* Only show profit column to admin users */}
                {canViewProfitNumbers && (
                  <TableHead className="text-right">Profit</TableHead>
                )}
                
                {/* Add AutoPay column */}
                <TableHead className="text-center">AutoPay</TableHead>
                
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.serviceType}</TableCell>
                  <TableCell>{formatDate(new Date(invoice.date))}</TableCell>
                  <TableCell>{formatDate(new Date(invoice.dueDate))}</TableCell>
                  <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`
                        ${invoice.status === 'paid' ? 'bg-green-50 text-green-700' : ''}
                        ${invoice.status === 'pending' ? 'bg-amber-50 text-amber-700' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-50 text-red-700' : ''}
                        ${invoice.status === 'draft' ? 'bg-gray-50 text-gray-700' : ''}
                      `}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  
                  {/* Only show profit column to admin users */}
                  {canViewProfitNumbers && (
                    <TableCell className="text-right text-green-600">
                      ${(invoice.amount * 0.35).toFixed(2)}
                    </TableCell>
                  )}
                  
                  {/* AutoPay column */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {invoice.id.includes('3') ? 'Enabled' : 'Not Set'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" /> Send to Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>
                        
                        {/* AutoPay setup action */}
                        <DropdownMenuItem>
                          <CreditCard className="mr-2 h-4 w-4" /> Set Up AutoPay
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No invoices found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filters, or create a new invoice.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

// CreditCard icon component
const CreditCard = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export default Invoices;
