import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "min-w-full border border-gray-300 text-sm text-left",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      className={cn("bg-gray-100 text-gray-700 uppercase", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }) {
  return (
    <tbody className={cn("text-gray-800", className)} {...props} />
  )
}

function TableFooter({ className, ...props }) {
  return (
    <tfoot className={cn("bg-gray-100 text-gray-700 uppercase", className)} {...props} />
  )
}

function TableRow({ className, ...props }) {
  return (
    <tr className={cn("hover:bg-gray-50", className)} {...props} />
  )
}

function TableHead({ className, ...props }) {
  return (
    <th className={cn("px-4 py-2 border", className)} {...props} />
  )
}

function TableCell({ className, ...props }) {
  return (
    <td className={cn("px-4 py-2 border", className)} {...props} />
  )
}

function TableCaption({ className, ...props }) {
  return (
    <caption className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
