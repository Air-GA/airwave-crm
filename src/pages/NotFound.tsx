
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="rounded-full bg-primary/10 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <FileSearch className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          We couldn't find the page you were looking for. The page might have been removed, renamed, or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => history.back()}>
            Go Back
          </Button>
          <Button asChild>
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
