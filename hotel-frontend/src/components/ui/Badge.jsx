import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary hover:bg-primary/20",
                secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
                success: "bg-success/10 text-success hover:bg-success/20",
                warning: "bg-warning/10 text-warning hover:bg-warning/20",
                danger: "bg-danger/10 text-danger hover:bg-danger/20",
                outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
