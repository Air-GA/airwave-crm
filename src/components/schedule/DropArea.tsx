
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DropAreaProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DropArea = ({ id, children, className }: DropAreaProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver ? "bg-primary-50 border-2 border-dashed border-primary" : ""
      )}
    >
      {children}
    </div>
  );
};

export default DropArea;
