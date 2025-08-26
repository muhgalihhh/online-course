"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from: Date; to?: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  numberOfMonths?: number;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    
    if (mode === "single" && selected instanceof Date) {
      return date.toDateString() === selected.toDateString();
    }
    
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return;
    
    if (mode === "single" && onSelect) {
      onSelect(date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isDateSelected(date);
      const isDisabled = disabled && disabled(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled}
          className={cn(
            "h-9 w-9 p-0 font-normal",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
            "rounded-md"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 p-0"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium">{monthYear}</div>
        <button
          onClick={() => navigateMonth('next')}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 p-0"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        <div className="font-medium text-muted-foreground">Su</div>
        <div className="font-medium text-muted-foreground">Mo</div>
        <div className="font-medium text-muted-foreground">Tu</div>
        <div className="font-medium text-muted-foreground">We</div>
        <div className="font-medium text-muted-foreground">Th</div>
        <div className="font-medium text-muted-foreground">Fr</div>
        <div className="font-medium text-muted-foreground">Sa</div>
        {renderCalendar()}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };