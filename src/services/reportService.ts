
import { ReportData } from "@/components/reports/ReportViewer";

// Generate random data based on report type
export const generateReportData = (reportType: string, reportName: string): ReportData => {
  // Common date labels
  const dateLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Common service types
  const serviceTypes = [
    "AC Repair", "AC Installation", "Heating Repair", 
    "Heating Installation", "Maintenance", "Duct Cleaning"
  ];

  // Generate mock data based on report type
  switch (reportType) {
    case "revenue":
      return {
        headers: ["Month", "Revenue", "Expenses", "Profit", "Growth"],
        rows: dateLabels.slice(0, 6).map((month, i) => {
          const revenue = Math.floor(Math.random() * 50000) + 30000;
          const expenses = Math.floor(Math.random() * 20000) + 15000;
          const profit = revenue - expenses;
          const growth = `${Math.floor(Math.random() * 20) - 5}%`;
          return [month, `$${revenue.toLocaleString()}`, `$${expenses.toLocaleString()}`, `$${profit.toLocaleString()}`, growth];
        }),
        summary: [
          { 
            title: "Total Revenue", 
            value: "$280,500", 
            change: "+12% from last period", 
            trend: "up" 
          },
          { 
            title: "Average Monthly Revenue", 
            value: "$46,750" 
          },
          { 
            title: "Profit Margin", 
            value: "38%", 
            change: "+2% from last period", 
            trend: "up" 
          }
        ],
        chartData: {
          labels: dateLabels.slice(0, 6),
          datasets: [{
            name: "Revenue",
            values: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50000) + 30000)
          }]
        }
      };
      
    case "technician":
      return {
        headers: ["Technician", "Jobs Completed", "Avg Completion Time", "Customer Rating", "Efficiency"],
        rows: [
          ["John Smith", 42, "2.4 hrs", "4.8/5", "94%"],
          ["Maria Garcia", 38, "2.1 hrs", "4.9/5", "97%"],
          ["David Johnson", 45, "2.6 hrs", "4.7/5", "91%"],
          ["Sarah Williams", 36, "2.2 hrs", "4.8/5", "95%"],
          ["Robert Brown", 40, "2.5 hrs", "4.6/5", "92%"]
        ],
        summary: [
          { 
            title: "Total Jobs Completed", 
            value: "201" 
          },
          { 
            title: "Avg Completion Time", 
            value: "2.36 hrs", 
            change: "-5% from last period", 
            trend: "up" 
          },
          { 
            title: "Avg Customer Rating", 
            value: "4.76/5" 
          }
        ],
        chartData: {
          labels: ["John", "Maria", "David", "Sarah", "Robert"],
          datasets: [{
            name: "Jobs Completed",
            values: [42, 38, 45, 36, 40]
          }]
        }
      };
      
    case "customer":
      return {
        headers: ["Month", "New Customers", "Repeat Customers", "Referrals", "Retention Rate"],
        rows: dateLabels.slice(0, 6).map((month, i) => {
          const newCustomers = Math.floor(Math.random() * 30) + 10;
          const repeatCustomers = Math.floor(Math.random() * 40) + 30;
          const referrals = Math.floor(Math.random() * 15) + 5;
          const retentionRate = `${Math.floor(Math.random() * 10) + 86}%`;
          return [month, newCustomers, repeatCustomers, referrals, retentionRate];
        }),
        summary: [
          { 
            title: "Total New Customers", 
            value: "125", 
            change: "+18% from last period", 
            trend: "up" 
          },
          { 
            title: "Customer Retention", 
            value: "92%", 
            change: "+3% from last period", 
            trend: "up" 
          },
          { 
            title: "Referral Rate", 
            value: "24%" 
          }
        ],
        chartData: {
          labels: dateLabels.slice(0, 6),
          datasets: [{
            name: "New Customers",
            values: Array.from({ length: 6 }, () => Math.floor(Math.random() * 30) + 10)
          }]
        }
      };
      
    case "workorder":
      return {
        headers: ["Service Type", "Total Orders", "Avg Completion Time", "First-Time Fix Rate", "Callback Rate"],
        rows: serviceTypes.map(service => {
          const orders = Math.floor(Math.random() * 50) + 20;
          const completionTime = `${(Math.random() * 2 + 1.5).toFixed(1)} hrs`;
          const firstTimeFix = `${Math.floor(Math.random() * 15) + 82}%`;
          const callbackRate = `${Math.floor(Math.random() * 8) + 1}%`;
          return [service, orders, completionTime, firstTimeFix, callbackRate];
        }),
        summary: [
          { 
            title: "Total Work Orders", 
            value: "258"
          },
          { 
            title: "Avg Completion Time", 
            value: "2.2 hrs", 
            change: "-8% from last period", 
            trend: "up" 
          },
          { 
            title: "First-Time Fix Rate", 
            value: "87%", 
            change: "+2% from last period", 
            trend: "up" 
          }
        ],
        chartData: {
          labels: serviceTypes,
          datasets: [{
            name: "Work Orders",
            values: Array.from({ length: serviceTypes.length }, () => Math.floor(Math.random() * 50) + 20)
          }]
        }
      };
      
    case "inventory":
      return {
        headers: ["Part Name", "Current Stock", "Used Last Month", "Reorder Level", "Status"],
        rows: [
          ["Compressor - 2.5 Ton", 12, 8, 10, "In Stock"],
          ["Air Handler - 3 Ton", 5, 4, 5, "Reorder Soon"],
          ["Refrigerant R-410A", 25, 18, 20, "In Stock"],
          ["Condenser Fan Motor", 7, 9, 10, "Reorder Soon"],
          ["Thermostat - Smart", 15, 12, 10, "In Stock"],
          ["Air Filter - MERV 13", 32, 28, 25, "In Stock"]
        ],
        summary: [
          { 
            title: "Total Parts", 
            value: "96" 
          },
          { 
            title: "Items Below Reorder", 
            value: "2", 
            trend: "down" 
          },
          { 
            title: "Inventory Value", 
            value: "$42,850" 
          }
        ],
        chartData: {
          labels: ["Compressor", "Air Handler", "Refrigerant", "Fan Motor", "Thermostat", "Air Filter"],
          datasets: [{
            name: "Current Stock",
            values: [12, 5, 25, 7, 15, 32]
          }]
        }
      };
      
    case "financial":
      return {
        headers: ["Service Type", "Revenue", "Cost", "Profit", "Margin"],
        rows: serviceTypes.map(service => {
          const revenue = Math.floor(Math.random() * 40000) + 20000;
          const cost = Math.floor(revenue * (Math.random() * 0.3 + 0.5));
          const profit = revenue - cost;
          const margin = `${Math.floor((profit / revenue) * 100)}%`;
          return [service, `$${revenue.toLocaleString()}`, `$${cost.toLocaleString()}`, `$${profit.toLocaleString()}`, margin];
        }),
        summary: [
          { 
            title: "Total Revenue", 
            value: "$325,800", 
            change: "+15% from last period", 
            trend: "up" 
          },
          { 
            title: "Average Profit Margin", 
            value: "38%", 
            change: "+3% from last period", 
            trend: "up" 
          },
          { 
            title: "Highest Margin Service", 
            value: "AC Installation (42%)" 
          }
        ],
        chartData: {
          labels: serviceTypes,
          datasets: [{
            name: "Profit Margin",
            values: Array.from({ length: serviceTypes.length }, () => Math.floor(Math.random() * 20) + 25)
          }]
        }
      };
      
    case "scheduling":
      return {
        headers: ["Day", "Scheduled Jobs", "Completed On Time", "Rescheduled", "Efficiency"],
        rows: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
          const scheduled = Math.floor(Math.random() * 15) + 10;
          const completed = Math.floor(scheduled * (Math.random() * 0.2 + 0.8));
          const rescheduled = scheduled - completed;
          const efficiency = `${Math.floor((completed / scheduled) * 100)}%`;
          return [day, scheduled, completed, rescheduled, efficiency];
        }),
        summary: [
          { 
            title: "Weekly Scheduled Jobs", 
            value: "68" 
          },
          { 
            title: "On-Time Completion", 
            value: "89%", 
            change: "+4% from last period", 
            trend: "up" 
          },
          { 
            title: "Rescheduling Rate", 
            value: "11%", 
            change: "-4% from last period", 
            trend: "up" 
          }
        ],
        chartData: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          datasets: [{
            name: "Jobs",
            values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 10)
          }]
        }
      };
      
    case "productivity":
      return {
        headers: ["Technician", "Jobs/Day", "Avg Service Time", "Travel Time %", "Efficiency Score"],
        rows: [
          ["John Smith", 3.8, "1.2 hrs", "22%", 92],
          ["Maria Garcia", 4.2, "1.0 hrs", "18%", 94],
          ["David Johnson", 3.6, "1.3 hrs", "25%", 89],
          ["Sarah Williams", 4.0, "1.1 hrs", "20%", 93],
          ["Robert Brown", 3.5, "1.4 hrs", "24%", 87]
        ],
        summary: [
          { 
            title: "Avg Jobs Per Day", 
            value: "3.8", 
            change: "+0.3 from last period", 
            trend: "up" 
          },
          { 
            title: "Avg Service Time", 
            value: "1.2 hrs", 
            change: "-0.1 hrs from last period", 
            trend: "up" 
          },
          { 
            title: "Overall Efficiency", 
            value: "91/100" 
          }
        ],
        chartData: {
          labels: ["John", "Maria", "David", "Sarah", "Robert"],
          datasets: [{
            name: "Efficiency Score",
            values: [92, 94, 89, 93, 87]
          }]
        }
      };
      
    default:
      // Default report data
      return {
        headers: ["Date", "Metric", "Value", "Change"],
        rows: Array(5).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return [
            date.toLocaleDateString(),
            "Sample Metric",
            Math.floor(Math.random() * 1000),
            `${Math.floor(Math.random() * 20) - 10}%`
          ];
        }),
        summary: [
          { 
            title: "Summary Metric", 
            value: Math.floor(Math.random() * 10000) 
          }
        ],
        chartData: {
          labels: Array(5).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString();
          }),
          datasets: [{
            name: "Sample Data",
            values: Array(5).fill(0).map(() => Math.floor(Math.random() * 1000))
          }]
        }
      };
  }
};

// Mock function to export report data as CSV
export const exportReportToCsv = (reportData: ReportData, reportName: string) => {
  if (!reportData) return;
  
  // Create CSV content
  let csvContent = reportData.headers.join(",") + "\n";
  
  reportData.rows.forEach(row => {
    csvContent += row.join(",") + "\n";
  });
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${reportName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
